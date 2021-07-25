from django.urls import path
from . import views

urlpatterns = [
    path('fetch-stock-info', views.fetchStockInfo, name="fetchStockInfo"),
    path('records', views.recordCRUD, name="records"),
    path('dividend', views.dividendCRUD, name="dividend")
]
