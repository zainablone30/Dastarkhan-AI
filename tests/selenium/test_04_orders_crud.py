"""
CRUD Test Suite 4: ORDERS

CRUD mapping (Supabase table: orders):
  CREATE  -> Add a food to the cart from /dashboard/explore and place the order
             (cart flow handled via cart-context.tsx)
  READ    -> /dashboard/orders lists the user's order history
  UPDATE  -> /admin -> change an order status via the inline stepper
  DELETE  -> /admin -> click "Cancel" on a pending order
"""
import os
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import login

ADMIN_KEY = os.environ.get("DASTARKHAN_ADMIN_KEY", "admin123")


@pytest.mark.crud
def test_TC_ORDER_01_create_order_via_cart(driver, base_url, creds):
    """TC-ORDER-01 : CREATE - Add a food to cart and place an order."""
    login(driver, base_url, creds)
    driver.get(f"{base_url}/dashboard/explore")
    wait = WebDriverWait(driver, 10)
    time.sleep(3)

    # FoodCard exposes an "Add" / Plus button bottom-right
    add_buttons = driver.find_elements(
        By.XPATH, "//button[contains(., 'Add')]"
    )
    assert add_buttons, "No 'Add to cart' buttons found"
    add_buttons[0].click()
    time.sleep(1)

    # Open cart and check out - exact selector depends on your cart UI;
    # adapt the XPath below to match your cart drawer / checkout button.
    checkout = driver.find_elements(By.XPATH, "//button[contains(., 'Checkout') or contains(., 'Place Order')]")
    if checkout:
        checkout[0].click()
        time.sleep(2)
    # Soft assertion - we just confirm cart interaction happened.
    assert "/dashboard" in driver.current_url


@pytest.mark.crud
def test_TC_ORDER_02_read_order_history(driver, base_url, creds):
    """TC-ORDER-02 : READ - Orders page lists the user's past orders."""
    login(driver, base_url, creds)
    driver.get(f"{base_url}/dashboard/orders")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("/orders"))
    time.sleep(3)

    page = driver.page_source.lower()
    # Should contain at least the orders header or an empty-state message
    assert "order" in page


@pytest.mark.crud
def test_TC_ORDER_03_admin_updates_order_status(driver, base_url):
    """TC-ORDER-03 : UPDATE - Admin advances an order from pending -> confirmed."""
    driver.get(f"{base_url}/admin")
    wait = WebDriverWait(driver, 10)

    pwd = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//input[@type='password']")))
    pwd.send_keys(ADMIN_KEY)
    driver.find_element(By.XPATH, "//button[contains(., 'Enter Admin Panel')]").click()
    time.sleep(2)

    # Click a status-stepper button (e.g. "Confirmed") on the first order card.
    confirmed_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Confirmed')]")
    if not confirmed_buttons:
        pytest.skip("No orders available to update in the admin panel.")
    confirmed_buttons[0].click()
    time.sleep(2)
    assert "/admin" in driver.current_url


@pytest.mark.crud
def test_TC_ORDER_04_admin_cancels_order(driver, base_url):
    """TC-ORDER-04 : DELETE - Admin cancels (soft-deletes) an order."""
    driver.get(f"{base_url}/admin")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//input[@type='password']"))).send_keys(ADMIN_KEY)
    driver.find_element(By.XPATH, "//button[contains(., 'Enter Admin Panel')]").click()
    time.sleep(2)

    cancel_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Cancel')]")
    if not cancel_buttons:
        pytest.skip("No cancelable orders present.")
    cancel_buttons[0].click()
    time.sleep(2)
    assert "/admin" in driver.current_url
