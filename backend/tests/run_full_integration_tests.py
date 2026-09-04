import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from app.main import app

def run_integration_tests():
    print("=" * 70)
    print(" RUNNING INTEGRATED PERSON 2 (REST API) + PERSON 3 (TRADING ENGINE) SUITE")
    print("=" * 70)

    client = TestClient(app)
    passed = 0
    failed = 0

    def assert_res(name, response, expected_status=200):
        nonlocal passed, failed
        if response.status_code == expected_status:
            print(f"  [PASS] {name} -> {response.status_code}")
            passed += 1
        else:
            print(f"  [FAIL] {name} -> Expected {expected_status}, got {response.status_code}: {response.text}")
            failed += 1

    # 1. Health Endpoint
    r0 = client.get("/")
    assert_res("1. Root Health Check (GET /)", r0, 200)

    # 2. Market Endpoint
    r1 = client.get("/api/market/NVDA")
    assert_res("2. Market Asset Endpoint (GET /api/market/NVDA)", r1, 200)
    if r1.status_code == 200:
        data = r1.json()
        assert data["symbol"] == "NVDA"
        assert data["price"] > 0

    # 3. Portfolio Endpoint
    r2 = client.get("/api/portfolio")
    assert_res("3. Portfolio Summary Endpoint (GET /api/portfolio)", r2, 200)
    if r2.status_code == 200:
        data = r2.json()
        assert data["totalValue"] > 0
        assert data["buyingPower"] > 0

    # 4. Positions Endpoint
    r3 = client.get("/api/positions")
    assert_res("5. Positions List Endpoint (GET /api/positions)", r3, 200)

    # 5. Trades Endpoint
    r4 = client.get("/api/trades")
    assert_res("4. Trades History Endpoint (GET /api/trades)", r4, 200)

    # 6. Orders Endpoint - Valid Market Order
    valid_order = {
        "symbol": "NVDA",
        "action": "BUY",
        "quantity": 10,
        "orderType": "MARKET"
    }
    r5 = client.post("/api/orders", json=valid_order)
    assert_res("6. Valid Order Submission (POST /api/orders)", r5, 201)
    if r5.status_code == 201:
        data = r5.json()
        assert data["symbol"] == "NVDA"
        assert data["quantity"] == 10
        assert data["status"] in ["FILLED", "SUBMITTED"]

    # 7. Orders Endpoint - Invalid Request (Negative Qty & empty symbol)
    invalid_order = {
        "symbol": "",
        "action": "INVALID",
        "quantity": -5
    }
    r6 = client.post("/api/orders", json=invalid_order)
    assert_res("7. Invalid Order Validation Error Handling (POST /api/orders -> 422)", r6, 422)

    # 8. Agent Status Endpoint
    r7 = client.get("/api/agent/status")
    assert_res("8. Agent Status Endpoint (GET /api/agent/status)", r7, 200)
    if r7.status_code == 200:
        data = r7.json()
        assert data["status"] == "ACTIVE"
        assert "confidence" in data

    # 9. Agent Decisions Endpoint
    r8 = client.get("/api/agent/decisions")
    assert_res("9. Agent Decisions Endpoint (GET /api/agent/decisions)", r8, 200)

    print("=" * 70)
    print(f" SUMMARY: {passed} PASSED, {failed} FAILED")
    print("=" * 70 + "\n")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_integration_tests()
