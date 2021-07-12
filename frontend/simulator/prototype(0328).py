import matplotlib.pyplot as plt
import numpy as np
import math


class Strategy():
    def recordQuantity(self, qToday, i):
        self.dailyQList.append(qToday)
        self.cumulQList.append(self.cumulQList[i-1] + qToday)

    def recordCashFlow(self, qToday, i):
        cashDeltaToday = -1 * qToday * self.pList[i]
        if qToday >= 0:
            self.cumulInvestCashList.append(
                self.cumulInvestCashList[i-1] - cashDeltaToday)
        else:
            self.cumulInvestCashList.append(
                self.cumulInvestCashList[i-1] * self.cumulQList[i]/self.cumulQList[i-1])
        self.cashList.append(self.cashList[i-1] + cashDeltaToday)

    def calcRateOfReturn(self, i):
        if self.cumulInvestCashList[i] > 0:
            self.rateOfReturnList.append(
                (self.securMktValList[i]-self.cumulInvestCashList[i])/self.cumulInvestCashList[i])
        else:
            self.rateOfReturnList.append(0)

    def recordAllInfo(self, qToday, i):
        self.recordQuantity(qToday, i)
        self.recordCashFlow(qToday, i)
        self.securMktValList.append(self.cumulQList[i] * self.pList[i])
        self.calcRateOfReturn(i)
        self.totalAssetsList.append(self.cashList[i] + self.securMktValList[i])


class BHmixGrid(Strategy):
    def __init__(self, initialTotalAsset, nDays, pList, r):
        self.totalAssetsList = [initialTotalAsset]
        self.nDays = nDays
        self.pList = pList
        self.r = r
        p0 = self.pList[0]
        q0 = self.calcQToday(r, initialTotalAsset, p0, p0)
        self.cumulInvestCashList = [q0*p0]
        self.cashList = [initialTotalAsset - q0*p0]
        self.securMktValList = [q0*p0]
        self.rateOfReturnList = [0]
        self.cumulQList = [q0]
        self.dailyQList = [q0]

    def followStrategy(self):
        latestMaxP = self.pList[0]
        latestMinP = self.pList[0]
        for i in range(1, self.nDays):
            qToday = 0
            if self.pList[i] < latestMaxP and self.pList[i] < latestMinP:
                # If no stock at hand now, set next sellable price.,
                if self.cumulQList[i-1] == 0:
                    latestMaxP = self.pList[i]
                qToday = self.calcQToday(
                    self.r, self.cashList[i-1], self.pList[i], latestMaxP, latestMinP)
                if qToday > 0:
                    latestMinP = self.pList[i]
            elif self.pList[i] > latestMaxP:    # price reach new high
                # Sell all out.
                qToday = -1 * self.cumulQList[i-1]
                latestMaxP = self.pList[i]
                # to prevent price rising too fast, ...
                # latestMaxP = min(self.pList[i], latestMaxP*1.01)
                latestMinP = self.pList[i]
            self.recordAllInfo(qToday, i)

    def calcQToday(self, r, cashOwned, pToday, latestMaxP, latestMinP):
        qIfAllIn = cashOwned/pToday
        baseQ = (latestMinP-pToday)/latestMinP*qIfAllIn
        # baseQ = r * qIfAllIn
        # 5 strategies are given:
        multiplier = latestMaxP/pToday
        # multiplier = -2*((pToday/latestMaxP)**2)+3
        # multiplier = -2 * (pToday/latestMaxP) + 3
        # multiplier = 1
        # multiplier = pToday/latestMaxP

        return math.floor(baseQ * multiplier)


class GridConstQ(Strategy):
    def __init__(self, initialTotalAsset, baseQ, nDays, pList):
        self.baseQ = baseQ
        self.nDays = nDays
        self.totalAssetsList = [initialTotalAsset]
        self.cumulInvestCashList = [baseQ*pList[0]]
        self.cashList = [initialTotalAsset - baseQ*pList[0]]
        self.securMktValList = [baseQ*pList[0]]
        self.rateOfReturnList = [0]
        self.pList = pList
        self.cumulQList = [baseQ]
        self.dailyQList = [baseQ]

    def followStrategy(self, maxPrice, minPrice, nTable):
        # numbers in divideLines are in descending order
        divideLines = [minPrice * i/nTable + maxPrice *
                       (nTable-i)/nTable for i in range(nTable+1)]
        standAt = self.calcStandAt(self.pList[0], divideLines)
        for i in range(1, self.nDays):
            newStandAt = self.calcStandAt(self.pList[i], divideLines)
            # If price rises, sell.
            qToday = 0
            if newStandAt < standAt:
                # If price isn't too high
                if newStandAt > 0:
                    if self.cumulQList[i-1] > 0:
                        qToday = max(-1*self.cumulQList[i-1], -1*self.baseQ)
            # If price falls, buy.
            elif newStandAt > standAt:
                # If price isn't too low
                if newStandAt < nTable:
                    qToday = self.baseQ
            self.recordAllInfo(qToday, i)
            standAt = newStandAt

    def calcStandAt(self, price, aList):
        result = 0
        for each in aList:
            if price >= each:
                break
            result += 1
        return result


class GridConstRatio(GridConstQ):
    def __init__(self, initialTotalAsset, nDays, pList, securityRatio):
        self.totalAssetsList = [initialTotalAsset]
        self.baseQ = round((initialTotalAsset*securityRatio)/pList[0])
        self.nDays = nDays
        self.cumulInvestCashList = [self.baseQ*pList[0]]
        self.cashList = [initialTotalAsset - self.baseQ*pList[0]]
        self.securMktValList = [self.baseQ*pList[0]]
        self.rateOfReturnList = [0]
        self.pList = pList
        self.cumulQList = [self.baseQ]
        self.dailyQList = [self.baseQ]

    def followStrategy(self, maxPrice, minPrice, nTable):
        # numbers in divideLines are in descending order
        divideLines = [minPrice * i/nTable + maxPrice *
                       (nTable-i)/nTable for i in range(nTable+1)]
        standAt = self.calcStandAt(self.pList[0], divideLines)
        for i in range(1, self.nDays):
            newStandAt = self.calcStandAt(self.pList[i], divideLines)
            qToday = 0
            # If price rises, sell.
            if newStandAt < standAt:
                # If price isn't too high
                if newStandAt > 0:
                    if self.cumulQList[i-1] > 0:
                        while (self.cumulQList[i-1]+qToday)*self.pList[i] > self.cashList[0]:
                            qToday -= 1
                        qToday = max(-1*self.cumulQList[i-1], qToday)
            # If price falls, buy.
            elif newStandAt > standAt:
                # If price isn't too low
                if newStandAt < nTable:
                    while (self.cumulQList[i-1]+qToday)*self.pList[i] < self.cashList[0]-(qToday*self.pList[i]):
                        qToday += 1
            self.recordAllInfo(qToday, i)
            standAt = newStandAt


class ChickenStrategy(Strategy):
    def __init__(self, initialTotalAsset, nDays, pList, r):
        self.totalAssetsList = [initialTotalAsset]
        self.nDays = nDays
        self.pList = pList
        self.r = r
        p0 = pList[0]
        q0 = self.calcQToday(r, initialTotalAsset, p0, p0)
        self.cumulInvestCashList = [q0*p0]
        self.cashList = [initialTotalAsset - q0*p0]
        self.securMktValList = [q0*p0]
        self.rateOfReturnList = [0]
        self.cumulQList = [q0]
        self.dailyQList = [q0]

    def followStrategy(self):
        latestMinP = self.pList[0]
        buyHistory = {}
        for i in range(1, self.nDays):
            qToday = 0
            # If price rises, buy in.
            if self.pList[i] > self.pList[i-1]:
                qToday = self.calcQToday(
                    self.r, self.cashList[i-1], self.pList[i], latestMinP)
                try:
                    buyHistory[round(self.pList[i], 3)] += qToday
                except:
                    buyHistory[round(self.pList[i], 3)] = qToday
            # Once price falls, sell almost all out.
            elif self.pList[i] < self.pList[i-1]:
                for each in buyHistory:
                    if each < self.pList[i]:
                        qToday -= buyHistory[each]
                        buyHistory[each] = 0
                latestMinP = self.pList[i]
            self.recordAllInfo(qToday, i)

    def calcQToday(self, r, cashOwned, pToday, latestMinP):
        qIfAllIn = cashOwned/pToday
        baseQ = r * qIfAllIn
        # 3 strategies for deciding multiplier are given:
        # multiplier = 1
        multiplier = latestMinP / pToday
        # multiplier = (latestMinP / pToday)**2

        return math.floor(baseQ * multiplier)


def simulatePriceFluct(initialP, nDays):
    deltaPList = [1]
    pList = [initialP]
    deltaPList.extend(list(np.random.normal(loc=1, scale=0.04, size=nDays-1)))
    for i in range(1, len(deltaPList)):
        pList.append(pList[-1]*deltaPList[i])
    return pList


def plotSingle(nDays, priceList, totalAssetsList, cumulInvestCashList, cashList, securMktValList, rateOfReturnList, figName):
    fig, axes = plt.subplots(nrows=2, ncols=2, sharex=False,
                             sharey=False, figsize=(10, 6))
    ax0 = axes[0][0]
    ax0.plot(range(nDays), priceList)
    ax0.set_ylabel('Price')

    ax2 = axes[0][1]
    ax2.plot(range(nDays), totalAssetsList, label="Total Assets", color="#C00")
    ax2.plot(range(nDays), cumulInvestCashList,
             label="Invested Cash", color="#0C0")
    ax2.plot(range(nDays), cashList, label="Cash", color="#00C")
    ax2.plot(range(nDays), securMktValList,
             label="Security Mkt Val", color="#CC0")
    yabs_max = max(ax2.get_ylim())
    ax2.set_ylim(ymin=0, ymax=yabs_max)
    ax2.legend()

    ax1 = axes[1][0]
    ax1.plot(range(nDays), totalAssetsList,
             color="#F00", label="Total Assets")
    yabs_max = abs(
        max(ax1.get_ylim(), key=lambda x: abs(x-totalAssetsList[0])))
    yabs_min = totalAssetsList[0]*2-yabs_max
    if yabs_max < yabs_min:
        yabs_max, yabs_min = yabs_min, yabs_max

    ax1.set_ylim(ymin=yabs_min, ymax=yabs_max)
    ax1.set_ylabel('Total Assets')
    ax1.tick_params(axis='y', labelcolor="#F00")

    ax1_2 = ax1.twinx()
    ax1_2.plot(range(nDays), priceList, label="Price")
    yabs_max = abs(
        max(ax1_2.get_ylim(), key=lambda x: abs(x-priceList[0])))
    yabs_min = priceList[0]*2-yabs_max
    if yabs_max < yabs_min:
        yabs_max, yabs_min = yabs_min, yabs_max

    ax1_2.set_ylim(ymin=yabs_min, ymax=yabs_max)
    ax1_2.set_ylabel('Price')
    ax1_2.tick_params(axis='y')

    ax3 = axes[1][1]
    ax3.plot(range(nDays), totalAssetsList, color="#F00")
    yabs_max = abs(
        max(ax3.get_ylim(), key=lambda x: abs(x-totalAssetsList[0])))
    yabs_min = totalAssetsList[0]*2-yabs_max
    if yabs_max < yabs_min:
        yabs_max, yabs_min = yabs_min, yabs_max

    ax3.set_ylim(ymin=yabs_min, ymax=yabs_max)
    ax3.set_ylabel('Total Assets')
    ax3.tick_params(axis='y', labelcolor="#F00")

    ax3_2 = ax3.twinx()
    ax3_2.plot(range(nDays), rateOfReturnList)
    yabs_max2 = abs(max(ax3_2.get_ylim(), key=abs))
    ax3_2.set_ylim(ymin=-yabs_max2, ymax=yabs_max2)
    ax3_2.set_ylabel('Rate of Return')
    ax3_2.tick_params(axis='y')
    fig.suptitle(figName, fontsize=14)
    fig.tight_layout()
    plt.show()


def plotComparison(nDays, priceList, data, nameList):
    colorList = ["#C00", "#0C0", "#CC0", "#00C", "#C0C", "#0CC", "#000"]
    fig, axes = plt.subplots(sharex=False, sharey=False, figsize=(7, 5))
    yabs_max, yabs_min = float('-inf'), float('inf')
    for i in range(len(data)):
        axes.plot(range(nDays), data[i], color=colorList[i], label=nameList[i])
        temp_yabs_max = abs(
            max(axes.get_ylim(), key=lambda x: abs(x-data[0][0])))
        temp_yabs_min = data[0][0]*2-temp_yabs_max
        if temp_yabs_max < temp_yabs_min:
            temp_yabs_max, temp_yabs_min = temp_yabs_min, temp_yabs_max
        yabs_min = min(yabs_min, temp_yabs_min)
        yabs_max = max(yabs_max, temp_yabs_max)
    axes.set_ylim(ymin=yabs_min, ymax=yabs_max)
    axes.set_ylabel('Total Assets')
    axes.tick_params(axis='y')
    axes.legend()

    ax1_2 = axes.twinx()
    ax1_2.plot(range(nDays), priceList, label="Price", color="#bbb")
    yabs_max = abs(max(ax1_2.get_ylim(), key=lambda x: abs(x-priceList[0])))
    yabs_min = priceList[0]*2-yabs_max
    if yabs_max < yabs_min:
        yabs_max, yabs_min = yabs_min, yabs_max
    ax1_2.set_ylim(ymin=yabs_min, ymax=yabs_max)
    ax1_2.set_ylabel('Price')
    ax1_2.tick_params(axis='y')

    fig.tight_layout()
    plt.show()


initialPrice = 100
initialTotalAssets = 10000
nDays = 360
pList = simulatePriceFluct(initialPrice, nDays)

# BH-Mix-Grid strategy
r = 0.05
z = BHmixGrid(initialTotalAssets, nDays, pList, r)
z.followStrategy()
# plot
plotSingle(z.nDays, pList, z.totalAssetsList, z.cumulInvestCashList,
           z.cashList, z.securMktValList, z.rateOfReturnList, "BH Mix Grid")

maxPrice = 200
minPrice = 20
numOfTable = 27
# grid strategy - constant ratio
securityRatio = 0.5
g1 = GridConstRatio(initialTotalAssets, nDays, pList, securityRatio)
g1.followStrategy(maxPrice, minPrice, numOfTable)
# plot
# plotSingle(g1.nDays, g1.pList, g1.totalAssetsList, g1.cumulInvestCashList,
#            g1.cashList, g1.securMktValList, g1.rateOfReturnList, "Grid (const. ratio)")

# grid strategy - constant quantity
initialQuantity = 5
g2 = GridConstQ(initialTotalAssets, initialQuantity, nDays, pList)
g2.followStrategy(maxPrice, minPrice, numOfTable)
# plot
# plotSingle(g2.nDays, g2.pList, g2.totalAssetsList, g2.cumulInvestCashList,
#            g2.cashList, g2.securMktValList, g2.rateOfReturnList, "Grid (const. q)")

# Chicken Strategy
r = 0.05
c = ChickenStrategy(initialTotalAssets, nDays, pList, r)
c.followStrategy()
# plot
# plotSingle(c.nDays, c.pList, c.totalAssetsList, c.cumulInvestCashList,
#            c.cashList, c.securMktValList, c.rateOfReturnList, "Chicken")

nameList = ["BH Mix Grid", "Grid const. Ratio",
            "Grid const. Q", "Chicken"]
data = [z.totalAssetsList, g1.totalAssetsList,
        g2.totalAssetsList, c.totalAssetsList]

plotComparison(g1.nDays, pList, data, nameList)
