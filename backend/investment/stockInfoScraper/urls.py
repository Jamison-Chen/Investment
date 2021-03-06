from django.urls import path
from . import views

urlpatterns = [
    path('fetch-stock-info', views.fetchStockInfo, name="fetchStockInfo"),
    path('trade', views.tradeCRUD, name="tradeCRUD"),
    path('dividend', views.dividendCRUD, name="dividendCRUD")
]
