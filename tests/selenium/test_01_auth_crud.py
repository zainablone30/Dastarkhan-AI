import time
import uuid
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


@pytest.mark.crud
def test_TC_AUTH_01_signup_creates_new_account(driver, base_url):
    """TC-AUTH-01 : CREATE - A new user can sign up with valid details."""
    unique_email = f"selenium_{uuid.uuid4().hex[:8]}@test.local"

    driver.get(f"{base_url}/signup")
    wait = WebDriverWait(driver, 10)

    wait.until(EC.presence_of_element_located((By.NAME, "fullName"))).send_keys("Selenium Tester")
    driver.find_element(By.NAME, "email").send_keys(unique_email)
    driver.find_element(By.NAME, "password").send_keys("12345678")
    driver.find_element(By.NAME, "confirmPassword").send_keys("12345678")
    driver.find_element(By.ID, "terms").click()
    driver.find_element(By.XPATH, "//button[contains(., 'Create Account')]").click()

    # Expected: redirect to /dashboard OR a success toast.
    wait.until(lambda d: "/dashboard" in d.current_url or "verify" in d.page_source.lower())
    assert "/login" not in driver.current_url, "Signup did not progress past /login"


@pytest.mark.crud
def test_TC_AUTH_02_login_with_valid_credentials(driver, base_url, creds):
    """TC-AUTH-02 : READ - An existing user can log in and reach the dashboard."""
    driver.get(f"{base_url}/login")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(creds["email"])
    driver.find_element(By.NAME, "password").send_keys(creds["password"])
    driver.find_element(By.XPATH, "//button[contains(., 'Sign In')]").click()

    wait.until(EC.url_contains("/dashboard"))
    assert "/dashboard" in driver.current_url


@pytest.mark.crud
def test_TC_AUTH_03_login_with_invalid_password_shows_error(driver, base_url, creds):
    """TC-AUTH-03 : NEGATIVE - Wrong password must NOT log the user in."""
    driver.get(f"{base_url}/login")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.NAME, "email"))).send_keys(creds["email"])
    driver.find_element(By.NAME, "password").send_keys("WRONG_PASSWORD_XYZ")
    driver.find_element(By.XPATH, "//button[contains(., 'Sign In')]").click()

    time.sleep(2)
    assert "/dashboard" not in driver.current_url, "Login succeeded with an invalid password!"
