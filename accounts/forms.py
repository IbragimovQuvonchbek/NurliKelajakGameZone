from django.contrib.auth.forms import UserCreationForm
from .models import User

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email')  # Add any other fields you want

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the default help text
        for fieldname in ['username', 'password1', 'password2']:
            self.fields[fieldname].help_text = None