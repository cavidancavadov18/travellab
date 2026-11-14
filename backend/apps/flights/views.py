from datetime import date

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import search_flights


def _parse_search(data):
    origin = str(data.get("origin") or "").strip().upper()
    destination = str(data.get("destination") or "").strip().upper()
    depart_date = str(data.get("depart_date") or "").strip()
    return_date = str(data.get("return_date") or "").strip() or None
    currency = str(data.get("currency") or "AZN").strip().upper() or "AZN"
    try:
        passengers = int(data.get("passengers") or 1)
    except (TypeError, ValueError):
        return None, Response({"detail": "passengers must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

    if not origin or not destination or not depart_date:
        return None, Response(
            {"detail": "origin, destination and depart_date are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if passengers < 1 or passengers > 9:
        return None, Response({"detail": "passengers must be between 1 and 9"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        date.fromisoformat(depart_date)
        if return_date:
            date.fromisoformat(return_date)
    except ValueError:
        return None, Response(
            {"detail": "depart_date/return_date must be YYYY-MM-DD"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return {
        "origin": origin,
        "destination": destination,
        "depart_date": depart_date,
        "return_date": return_date,
        "passengers": passengers,
        "currency": currency,
    }, None


class FlightSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        parsed, error = _parse_search(request.query_params)
        if error:
            return error
        return Response(search_flights(**parsed))

    def post(self, request):
        parsed, error = _parse_search(request.data)
        if error:
            return error
        return Response(search_flights(**parsed))