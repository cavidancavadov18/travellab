from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LabpointTransactionSerializer, LabpointWalletSerializer, RedeemSerializer
from .services import get_or_create_wallet, redeem_points


class LabpointBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet = get_or_create_wallet(request.user)
        return Response(LabpointWalletSerializer(wallet).data)


class LabpointHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet = get_or_create_wallet(request.user)
        txs = wallet.transactions.all()[:50]
        return Response(LabpointTransactionSerializer(txs, many=True).data)


class LabpointRedeemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RedeemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            wallet = redeem_points(
                request.user,
                serializer.validated_data["amount"],
                description=serializer.validated_data.get("description") or "Manual redeem",
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(LabpointWalletSerializer(wallet).data)
