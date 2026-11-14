from django.contrib.auth.forms import AuthenticationForm


class AdminAuthenticationForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["username"].label = "İstifadəçi adı və ya email"
        self.fields["username"].widget.attrs.update(
            {
                "placeholder": "admin",
                "autofocus": True,
            }
        )
        self.fields["password"].widget.attrs.update({"placeholder": "admin"})
