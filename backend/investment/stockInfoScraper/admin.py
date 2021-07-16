from django.contrib import admin
from .models import TradeRecord, StockInfo


class TradeRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "dealTime", "sid", "companyName",
                    "dealPrice", "dealQuantity", "handlingFee")


class StockInfoAdmin(admin.ModelAdmin):
    list_display = ("id", "date", "sid", "companyName",
                    "tradeType", "quantity", "openPrice",
                    "closePrice", "highestPrice", "lowestPrice",
                    "fluctPrice", "fluctRate")


admin.site.register(TradeRecord, TradeRecordAdmin)
admin.site.register(StockInfo, StockInfoAdmin)
