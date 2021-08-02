from django.contrib import admin
from .models import TradeRecord, StockInfo, CashDividendRecord


class TradeRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "dealTime", "sid", "companyName",
                    "dealPrice", "dealQuantity", "handlingFee")


class CashDividendRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "dealTime", "sid", "companyName", "cashDividend")


class StockInfoAdmin(admin.ModelAdmin):
    list_display = ("id", "date", "sid", "companyName",
                    "tradeType", "quantity", "openPrice",
                    "closePrice", "highestPrice", "lowestPrice",
                    "fluctPrice", "fluctRate")


admin.site.register(TradeRecord, TradeRecordAdmin)
admin.site.register(CashDividendRecord, CashDividendRecordAdmin)
admin.site.register(StockInfo, StockInfoAdmin)
# User Name: Jamison
# Password: jamison22512908
