import threading

from app.db import connect, init_db


def test_connection_can_be_used_from_another_thread(tmp_path):
    """FastAPI opens the request connection in one worker thread and runs the
    endpoint in another; the real server crashed on this before check_same_thread=False."""
    path = str(tmp_path / "t.db")
    init_db(path)
    conn = connect(path)
    result = {}

    def use():
        try:
            result["n"] = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        except Exception as exc:  # noqa: BLE001
            result["err"] = exc

    t = threading.Thread(target=use)
    t.start()
    t.join()
    conn.close()
    assert result == {"n": 0}
