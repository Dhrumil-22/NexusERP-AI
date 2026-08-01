from rest_framework import viewsets
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
import csv
from datetime import datetime, timedelta
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from invoicing_finance.models import Invoice
from inventory.models import Product
from sales_orders.models import Order
from attendance.models import AttendanceRecord
from .serializers import KeyValueSerializer, StatusCountSerializer, LowStockItemSerializer, GenericAnalyticsResponseSerializer

class ReportsAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        return Response({"message": "Use specific action endpoints for analytics."})

    @action(detail=False, methods=['get'])
    def revenue(self, request):
        tenant_id = request.user.tenant_id
        today = timezone.now().date()
        invoices = Invoice.objects.filter(tenant_id=tenant_id, created_at__date=today)
        total_revenue = sum(inv.total for inv in invoices)
        return Response({"total_revenue": total_revenue})

    @action(detail=False, methods=['get'])
    def top_items(self, request):
        tenant_id = request.user.tenant_id
        
        # Tally up item quantities sold in Orders
        item_counts = {}
        for so in Order.objects.filter(tenant_id=tenant_id):
            for item in so.items.all():
                item_counts[item.product_id] = item_counts.get(item.product_id, 0) + float(item.quantity)
        
        # Sort and take top 5
        top = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        data = []
        for k, v in top:
            try:
                prod = Product.objects.get(id=k, tenant_id=tenant_id)
                name = prod.name
            except Exception:
                name = "Unknown Product"
            data.append({"key": name, "value": v})
            
        serializer = KeyValueSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def orders_by_status(self, request):
        tenant_id = request.user.tenant_id
        status_counts = {}
        for so in Order.objects.filter(tenant_id=tenant_id):
            status_counts[so.status] = status_counts.get(so.status, 0) + 1
            
        data = [{"status": k, "count": v} for k, v in status_counts.items()]
        serializer = StatusCountSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        tenant_id = request.user.tenant_id
        low_items = []
        for item in Product.objects.filter(tenant_id=tenant_id):
            if item.stock_quantity <= item.reorder_threshold:
                low_items.append({
                    "item_id": str(item.id),
                    "item_name": item.name,
                    "current_stock": float(item.stock_quantity),
                    "threshold": float(item.reorder_threshold)
                })
                
        serializer = LowStockItemSerializer(low_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def attendance_summary(self, request):
        tenant_id = request.user.tenant_id
        today = timezone.now().date()
        
        records = AttendanceRecord.objects.filter(tenant_id=tenant_id, date=today)
        total_records = len(records)
        completed_shifts = sum(1 for r in records if r.clock_out is not None)
        
        data = [{"key": "Total Scheduled", "value": total_records},
                {"key": "Completed Shifts", "value": completed_shifts}]
                
        serializer = KeyValueSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def sales_trend(self, request):
        tenant_id = request.user.tenant_id
        
        # Sales trend by day
        trend = {}
        for inv in Invoice.objects.filter(tenant_id=tenant_id):
            day_str = inv.created_at.strftime('%Y-%m-%d')
            trend[day_str] = trend.get(day_str, 0) + float(inv.total)
            
        data = [{"key": k, "value": v} for k, v in trend.items()]
        serializer = KeyValueSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export_report(self, request):
        tenant_id = request.user.tenant_id
        period = request.query_params.get('period', 'daily')
        
        now = timezone.now()
        if period == 'weekly':
            start_date = now - timedelta(days=7)
        elif period == 'monthly':
            start_date = now - timedelta(days=30)
        else:
            start_date = now - timedelta(days=1)
            
        invoices = Invoice.objects.filter(tenant_id=tenant_id, created_at__gte=start_date)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="report_{period}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Invoice ID', 'Date', 'Customer ID', 'Total Amount', 'Status'])
        for inv in invoices:
            writer.writerow([str(inv.id), inv.created_at.strftime('%Y-%m-%d %H:%M'), str(inv.customer_id), inv.total, inv.status])
            
        return response
