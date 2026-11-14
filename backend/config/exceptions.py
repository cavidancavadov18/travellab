from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        detail = response.data
        if isinstance(detail, dict) and "detail" in detail and len(detail) == 1:
            message = detail["detail"]
        else:
            message = detail
        response.data = {
            "success": False,
            "error": message,
            "status_code": response.status_code,
        }
        return response

    return Response(
        {
            "success": False,
            "error": "Internal server error",
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
