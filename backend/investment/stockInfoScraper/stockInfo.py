import time
import datetime
import csv
from io import StringIO
from requests import post, get
import json
import shutil
from pyquery import PyQuery as pq
from .models import StockInfo


class StockInfoView:
    def __init__(self):
        # info of multiple stocks, single day
        self.endPoint1 = "https://www.twse.com.tw/exchangeReport/MI_INDEX"
        self.endPoint12 = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch="
        # info of single stock, multiple days
        # self.endPoint2 = "https://www.twse.com.tw/exchangeReport/STOCK_DAY"
        self.recordedDate = self.getRecordDate()
        self.sid2NameDict = {}
        self.infoList = []
        self.infoDictList = []
        self.result = []

    def getRecordDate(self):
        q = StockInfo.objects.all()
        if len(q) > 0:
            return int(StockInfo.objects.all()[0].date)
        return 0

    def fetchAndStore(self, sidList, mode):
        try:
            allData = []
            for each in sidList:
                try:
                    res = get(self.endPoint12 + "tse_" + each + ".tw")
                    res = json.loads(pq(res.text).text())["msgArray"][0]
                except:
                    try:
                        res = get(self.endPoint12 + "otc_" + each + ".tw")
                        res = json.loads(pq(res.text).text())["msgArray"][0]
                    except:
                        print("failed to fetch %s" % each)
                        continue
                dataRow = {}
                dataRow["date"] = res["d"].split('.')[0]
                dataRow["sid"] = res["ch"].split('.')[0]
                dataRow["name"] = res["n"]
                dataRow["trade-type"] = res["ex"]
                dataRow["quantity"] = res["v"]
                dataRow["open"] = str(round(float(res["o"]), 2))
                try:  # 漲停板時，z 會是 "-"，所以改看最高價
                    dataRow["close"] = str(round(float(res["z"]), 2))
                except:
                    dataRow["close"] = str(round(float(res["h"]), 2))
                dataRow["highest"] = str(round(float(res["h"]), 2))
                dataRow["lowest"] = str(round(float(res["l"]), 2))
                dataRow["fluct-price"] = str(
                    round((float(dataRow["close"])-float(res["y"])), 2))
                dataRow["fluct-rate"] = str(
                    round((float(dataRow["close"])-float(res["y"]))/float(res["y"]), 4))
                allData.append(dataRow)
            if mode == "refreshInfo":
                for each in allData:
                    q = StockInfo.objects.filter(sid=each["sid"])
                    if len(q) != 0:
                        q = q.get()
                        q.date = each["date"]
                        q.companyName = each["name"]
                        q.tradeType = each["trade-type"]
                        q.quantity = each["quantity"]
                        q.openPrice = each["open"]
                        q.closePrice = each["close"]
                        q.highestPrice = each["highest"]
                        q.lowestPrice = each["lowest"]
                        q.fluctPrice = each["fluct-price"]
                        q.fluctRate = each["fluct-rate"]
                        q.save()
                    else:
                        s = StockInfo(date=each["date"],
                                      sid=each["sid"],
                                      companyName=each["name"],
                                      tradeType=each["trade-type"],
                                      quantity=each["quantity"],
                                      openPrice=each["open"],
                                      closePrice=each["close"],
                                      highestPrice=each["highest"],
                                      lowestPrice=each["lowest"],
                                      fluctPrice=each["fluct-price"],
                                      fluctRate=each["fluct-rate"])
                        s.save()
            elif mode == "append":
                for each in allData:
                    s = StockInfo(date=each["date"],
                                  sid=each["sid"],
                                  companyName=each["name"],
                                  tradeType=each["trade-type"],
                                  quantity=each["quantity"],
                                  openPrice=each["open"],
                                  closePrice=each["close"],
                                  highestPrice=each["highest"],
                                  lowestPrice=each["lowest"],
                                  fluctPrice=each["fluct-price"],
                                  fluctRate=each["fluct-rate"])
                    s.save()
            self.result.extend(allData)
        except Exception as e:
            raise e

    def stocksSingleDay(self, date=time.strftime("%Y%m%d", time.localtime(time.time())), sidList=[]):
        currentHour = int(time.strftime("%H", time.localtime(time.time())))
        if currentHour < 14:
            date = datetime.datetime.strptime(
                date, "%Y%m%d")-datetime.timedelta(days=1)
            date = date.strftime("%Y%m%d")
        date = int(date)
        try:
            if self.recordedDate != date:
                self.fetchAndStore(sidList, "refreshInfo")
                self.recordedDate = date
        except Exception as e:
            raise e
        self.getInfo(sidList)

    def getInfo(self, sidList=[]):
        newSid = []
        # q = StockInfo.objects.all()
        # existingSid = [each.sid for each in q]
        # newSid = list(set(sidList)-set(existingSid))
        for eachSid in sidList:
            q = StockInfo.objects.filter(sid=eachSid)
            if len(q) != 0:
                q = q.get()
                self.result.append({"date": q.date,
                                    "sid": q.sid,
                                    "name": q.companyName,
                                    "trade-type": q.tradeType,
                                    "quantity": q.quantity,
                                    "open": q.openPrice,
                                    "close": q.closePrice,
                                    "highest": q.highestPrice,
                                    "lowest": q.lowestPrice,
                                    "fluct-price": q.fluctPrice,
                                    "fluct-rate": q.fluctRate})
            else:
                newSid.append(eachSid)
        if len(newSid) != 0:
            # the function below will also append these new stock info into "result"
            self.fetchAndStore(newSid, "append")
