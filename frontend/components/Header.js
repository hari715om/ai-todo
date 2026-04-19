"use client";

import Image from "next/image";
import { clearAuth, getUser } from "../lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    router.replace("/");
  }

  return (
    <header className="header">
      <div className="header-inner">
        <span className="header-logo">AI Todo</span>

        <div className="header-right">
          {user && (
            <div className="header-user">
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt={user.name || "User"}
                  width={28}
                  height={28}
                  className="header-avatar"
                />
              ) : (
                <div className="header-avatar-placeholder">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="header-name">{user.name}</span>
            </div>
          )}
          <button
            id="logout-btn"
            className="btn btn-secondary btn-sm"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
