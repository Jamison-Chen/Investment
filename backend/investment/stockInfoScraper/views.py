from django.shortcuts import render
# from django.http.response import HttpResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .stockInfo import StockInfoView
from .tradeRecord import TradeRecordView


@csrf_exempt
def fetchStockInfo(request):
    if request.method == 'GET':
        s = StockInfoView()
        date = str(request.GET.get("date")) if request.GET.get(
            "date") != None else None
        sidList = str(request.GET.get("sid-list")).split(
            ",") if request.GET.get("sid-list") != None else []
        companyNameList = str(request.GET.get("companyName-list")).split(
            ",") if request.GET.get("companyName-list") != None else []
        result = None
        try:
            if date != None:
                s.stocksSingleDay(date=date, sidList=sidList)
            else:
                s.stocksSingleDay(sidList=sidList)
            result = json.dumps({"data": s.result})
        except Exception as e:
            result = json.dumps({"Error Message from views": str(e)})
        response = HttpResponse(result)
        response["Access-Control-Allow-Origin"] = "*"
        return response


@csrf_exempt
def recordCRUD(request):
    if request.method == "POST":
        mode = str(request.POST.get("mode"))
        s = TradeRecordView()
        ID = str(request.POST.get("id"))
        dealTime = str(request.POST.get("deal-time"))
        sid = str(request.POST.get("sid"))
        dealPrice = str(request.POST.get("deal-price"))
        dealQuantity = str(request.POST.get("deal-quantity"))
        handlingFee = str(request.POST.get("handling-fee"))
        result = None
        if mode == "create":
            if dealTime == "" or sid == "" or dealPrice == "" or dealQuantity == "" or handlingFee == "":
                result = {"error-message": "Data not sufficient."}
            else:
                s.createTradeLog(dealTime, sid, dealPrice,
                                 dealQuantity, handlingFee)
                result = {"success-message": "creation-success"}
        elif mode == "read":
            dealTimeList = str(request.POST.get("deal-time-list")).split(
                ",") if request.POST.get("deal-time-list") != None else []
            sidList = str(request.POST.get("sid-list")).split(
                ",") if request.POST.get("sid-list") != None else []
            result = {"data": s.readTradeLog(dealTimeList, sidList)}
        elif mode == "update":
            if ID == "" or dealTime == "" or sid == "" or dealPrice == "" or dealQuantity == "" or handlingFee == "":
                result = {"error-message": "Data not sufficient."}
            else:
                s.updateTradeLog(ID, dealTime, sid, dealPrice,
                                 dealQuantity, handlingFee)
                result = {"success-message": "update-success"}
        elif mode == "delete":
            s.deleteTradeLog(ID)
            result = {"success-message": "deletion-success"}
        else:
            result = {"error-message": "Mode Not Exsist"}
        result = json.dumps(result)
    else:
        result = {"error-message": "Only POST methods are available."}
    response = HttpResponse(result)
    response["Access-Control-Allow-Origin"] = "*"
    return response
