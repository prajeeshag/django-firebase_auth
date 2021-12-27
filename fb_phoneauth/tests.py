import os
import time

from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver.chrome import options
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from django.conf import settings


class AccountTestCase(StaticLiveServerTestCase):

    @classmethod
    def setUpClass(cls) -> None:
        HEADLESS = os.getenv('HEADLESS', 'True') == 'True'
        SELENIUM_EXPLICIT_WAIT = int(os.getenv('SELENIUM_EXPLICIT_WAIT', '60'))
        FIREBASE_SKIP_VERIFY_TOKEN = os.getenv(
            'FIREBASE_SKIP_VERIFY_TOKEN', 'False') == 'True'
        options = Options()
        if HEADLESS:
            options.add_argument("--window-size=1920,1080")
            options.add_argument("--start-maximized")
            options.add_argument("--headless")
        cls.selenium = WebDriver(options=options)
        cls.selenium.implicitly_wait(10)
        cls.wait = WebDriverWait(cls.selenium, SELENIUM_EXPLICIT_WAIT)
        cls.old_settings = settings
        settings.FIREBASE_TESTING_MODE = True
        settings.FIREBASE_SKIP_VERIFY_TOKEN = FIREBASE_SKIP_VERIFY_TOKEN
        super().setUpClass()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.selenium.quit()
        settings.FIREBASE_TESTING_MODE = cls.old_settings.FIREBASE_TESTING_MODE
        settings.FIREBASE_SKIP_VERIFY_TOKEN = cls.old_settings.FIREBASE_SKIP_VERIFY_TOKEN
        super().tearDownClass()

    def test_login(self):
        num_code = (
            ('9999999999', '999999'),
            ('9999999997', '999997'),
        )
        for (number, code) in num_code:
            self.login_test(number, code)

    def login_test(self, number, code):
        self.selenium.get('%s%s' % (self.live_server_url,
                          '/phone_login/?next=/phone_login/__test__/'))
        self.wait.until(EC.visibility_of_element_located(
            (By.XPATH, "//div[@class='iti__selected-flag']")))
        time.sleep(2)
        phone_number = self.selenium.find_element_by_id('id_phone_number')
        otp = self.selenium.find_element_by_id('verification-code')
        signinbutton = self.selenium.find_element_by_id('sign-in-button')
        verbutton = self.selenium.find_element_by_id('verify-code-button')
        self.slow_send_keys(phone_number, number)
        signinbutton.click()
        time.sleep(1)
        self.slow_send_keys(otp, code)
        verbutton.click()
        time.sleep(2)
        timeout = 20
        WebDriverWait(self.selenium, timeout).until(
            lambda driver: driver.find_element_by_tag_name('body').text == 'Success')

    def slow_send_keys(self, obj, string):
        for chr in string:
            obj.send_keys(chr)
            time.sleep(0.1)
