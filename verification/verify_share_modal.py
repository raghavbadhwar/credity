from playwright.sync_api import sync_playwright, expect
import time
import re

def run():
    with sync_playwright() as p:
        # Launch browser with clipboard permissions
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(permissions=["clipboard-read", "clipboard-write"])
        page = context.new_page()

        try:
            # Mock the wallet initialization
            page.route("**/api/wallet/init", lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"success":true, "wallet": {"did": "did:example:123"}, "stats": {"totalCredentials": 1}}'
            ))

            # Mock credentials - using regex to catch query params safely
            page.route(re.compile(r".*/api/wallet/credentials.*"), lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"credentials": [{"id": "1", "type": ["VerifiableCredential", "UniversityDegree"], "issuer": "University of Example", "issuanceDate": "2023-01-01", "data": {"name": "Bachelor of Science"}, "category": "education", "anchorStatus": "anchored", "hash": "0x123", "verificationCount": 0}]}'
            ))

            # Mock the share endpoint
            page.route("**/api/wallet/share", lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"shareUrl": "https://example.com/verify/123", "share": {"id": "share-123", "expiry": "2023-01-02T00:00:00Z"}, "qrData": "mock-qr-data"}'
            ))

            # Also mock fields endpoint
            page.route("**/api/wallet/credentials/1/fields", lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"fields": ["name", "degree", "honors"]}'
            ))

            # Navigate to the dashboard
            page.goto("http://localhost:5000/")

            print("Waiting for page to load...")
            # Wait for the dashboard to load (look for "My Credentials")
            page.wait_for_selector("text=My Credentials", timeout=10000)

            # Wait for credentials to actually populate
            page.wait_for_selector("text=Bachelor of Science", timeout=5000)

            # Take a screenshot of the dashboard to confirm loaded state
            page.screenshot(path="verification/dashboard_loaded.png")

            print("Opening Share Modal...")
            # Click the "Share via QR" button.
            share_btn = page.get_by_text("Share via QR")
            share_btn.click()

            print("Waiting for modal...")
            # Wait for modal to appear
            expect(page.get_by_text("Share Credential Securely")).to_be_visible(timeout=5000)

            print("Switching to Share Link tab...")
            # Let's click "Generate Secure Share"
            page.click("text=Generate Secure Share")

            # Wait for success toast or result
            page.wait_for_selector("text=Share Created")

            # Now click the "Share Link" tab.
            page.click("text=Share Link")

            # Locate the copy button
            copy_button = page.get_by_label("Copy link to clipboard")
            expect(copy_button).to_be_visible()

            print("Hovering over copy button to test tooltip...")
            copy_button.hover()

            # Check for tooltip "Copy link"
            tooltip_text = page.get_by_text("Copy link")
            expect(tooltip_text).to_be_visible()

            # Take screenshot of tooltip state
            page.screenshot(path="verification/tooltip_hover.png")
            print("Screenshot saved: verification/tooltip_hover.png")

            print("Clicking copy button...")
            copy_button.click()

            # Check for tooltip update to "Copied!"
            copied_text = page.get_by_text("Copied!")
            expect(copied_text).to_be_visible()

            # Take screenshot of copied state
            page.screenshot(path="verification/tooltip_copied.png")
            print("Screenshot saved: verification/tooltip_copied.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
            print("Screenshot saved: verification/error_state.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
