from django.db import models


class TradeRecord(models.Model):
    dealTime = models.BigIntegerField()
    sid = models.CharField(max_length=32)
    companyName = models.CharField(max_length=32)
    dealPrice = models.FloatField()
    dealQuantity = models.BigIntegerField()
    handlingFee = models.BigIntegerField()


class StockInfo(models.Model):
    date = models.BigIntegerField()
    sid = models.CharField(max_length=32)
    companyName = models.CharField(max_length=32)
    tradeType = models.CharField(max_length=32)
    quantity = models.BigIntegerField()
    openPrice = models.FloatField()
    closePrice = models.FloatField()
    highestPrice = models.FloatField()
    lowestPrice = models.FloatField()
    fluctPrice = models.FloatField()
    fluctRate = models.FloatField()
