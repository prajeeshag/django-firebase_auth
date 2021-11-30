from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

from django.contrib.auth.models import AbstractBaseUser
# Create your models here.


class User(AbstractBaseUser):
    USERNAME_FIELD = 'mobile_number'
    mobile_number = PhoneNumberField(null=True, unique=True)
