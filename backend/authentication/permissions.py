from rest_framework.permissions import BasePermission
class IsAdminRole(BasePermission):
    def has_permission(self,request,view):
        u=request.user
        return bool(u and u.is_authenticated and (u.is_superuser or (hasattr(u,"profile") and u.profile.role=="ADMIN")))
