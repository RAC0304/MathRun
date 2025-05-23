import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../login.css";
import supabase from "../config/supabase";
import { dummySiswa, dummyGuru, staticCredentials } from "../config/mockData";
import {
  loginSiswa,
  loginGuru,
  loginAdmin,
  updateSiswaAvatar,
} from "../services/database";
import { motion } from "framer-motion";

// Import all animal avatars
import anjingAvatar from "../assets/anjing.png";
import babiAvatar from "../assets/babi.png";
import bebekAvatar from "../assets/bebek.png";
import guritaAvatar from "../assets/gurita.png";
import harimauAvatar from "../assets/harimau.png";
import kelinciAvatar from "../assets/kelinci.png";
import kucingAvatar from "../assets/kucing.png";
import sapiAvatar from "../assets/sapi.png";
import serigalaAvatar from "../assets/serigala.png";
import singaAvatar from "../assets/singa.png";

// Define avatar options using the imported images
const avatarOptions = [
  { name: "Anjing", src: anjingAvatar },
  { name: "Babi", src: babiAvatar },
  { name: "Bebek", src: bebekAvatar },
  { name: "Gurita", src: guritaAvatar },
  { name: "Harimau", src: harimauAvatar },
  { name: "Kelinci", src: kelinciAvatar },
  { name: "Kucing", src: kucingAvatar },
  { name: "Sapi", src: sapiAvatar },
  { name: "Serigala", src: serigalaAvatar },
  { name: "Singa", src: singaAvatar },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [_selectedAvatar, _setSelectedAvatar] = useState(null);
  const [role, setRole] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [connectionChecking, setConnectionChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedRole = localStorage.getItem("selectedRole");
    if (selectedRole) {
      setRole(selectedRole);
    } else {
      navigate("/");
    }
    checkConnection();
  }, [navigate]);

  useEffect(() => {
    const checkOfflineMode = () => {
      if (navigator.onLine) {
        if (isOfflineMode && retryCount < 3) {
          checkConnection();
        }
      } else {
        setIsOfflineMode(true);
        setConnectionChecking(false);
      }
    };

    window.addEventListener("online", checkOfflineMode);
    window.addEventListener("offline", () => {
      setIsOfflineMode(true);
      setConnectionChecking(false);
    });

    checkOfflineMode();

    return () => {
      window.removeEventListener("online", checkOfflineMode);
      window.removeEventListener("offline", () => {
        setIsOfflineMode(true);
        setConnectionChecking(false);
      });
    };
  }, [isOfflineMode, retryCount]);

  const checkConnection = async () => {
    try {
      setConnectionChecking(true);

      // First check navigator.onLine
      if (!navigator.onLine) {
        console.log("Browser reports offline");
        setIsOfflineMode(true);
        return false;
      }

      if (!supabase) {
        console.error("Supabase client not initialized");
        setIsOfflineMode(true);
        return false;
      }

      // Simple test query to check connection
      try {
        const { error } = await supabase
          .from("siswa")
          .select("id_siswa")
          .limit(1);

        if (error) {
          console.error("Database connection error:", error);
          setIsOfflineMode(true);
          return false;
        }

        setIsOfflineMode(false);
        return true;
      } catch (dbError) {
        console.error("Database test failed:", dbError);
        setIsOfflineMode(true);
        return false;
      }
    } catch (error) {
      console.error("Connection check error:", error);
      setIsOfflineMode(true);
      return false;
    } finally {
      setConnectionChecking(false);
    }
  };

  const retryConnection = () => {
    setRetryCount((prevCount) => prevCount + 1);
    checkConnection();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!role) {
      setError("Error: Role tidak terdeteksi");
      setLoading(false);
      return;
    }

    try {
      // Coba periksa koneksi, tapi jangan biarkan error menghentikan proses login
      try {
        await checkConnection();
      } catch (connError) {
        console.error("Error saat memeriksa koneksi:", connError);
        setIsOfflineMode(true);
      }

      // Jika dalam mode offline, langsung gunakan login offline
      if (isOfflineMode) {
        console.log("Menggunakan mode offline untuk login");
        handleOfflineLogin();
        return;
      }

      // Online mode
      if (role === "siswa") {
        try {
          console.log(
            "Mencoba login dengan nama:",
            username,
            "dan NIS:",
            password
          );

          // Gunakan fungsi loginSiswa dari database.js yang sudah diperbaiki
          const userData = await loginSiswa(username, password);

          if (!userData) {
            console.error(
              "Tidak ada data yang ditemukan untuk kredensial tersebut"
            );
            setError("Nama atau NIS siswa salah!");
            setLoading(false);
            return;
          }

          console.log("Login berhasil dengan user:", userData);
          localStorage.setItem("userData", JSON.stringify(userData));

          // Tandai apakah login menggunakan data offline
          if (userData.offline) {
            setIsOfflineMode(true);
            localStorage.setItem("isOfflineMode", "true");
          }

          setLoginSuccess(true);
        } catch (error) {
          console.error("Error during siswa login:", error);

          // Coba login offline sebagai fallback
          console.log("Mencoba fallback ke mode offline setelah error");
          handleOfflineLogin();
        }
      } else if (role === "guru") {
        try {
          console.log(
            "Mencoba login guru dengan nama:",
            username,
            "dan NUPTK:",
            password
          );

          // Gunakan fungsi loginGuru dari database.js yang sudah diperbaiki
          const userData = await loginGuru(username, password);

          if (!userData) {
            console.error(
              "Tidak ada data guru yang ditemukan untuk kredensial tersebut"
            );
            setError("Nama atau NUPTK guru salah!");
            setLoading(false);
            return;
          }

          console.log("Login guru berhasil dengan user:", userData);
          localStorage.setItem("userData", JSON.stringify(userData));

          // Tandai apakah login menggunakan data offline
          if (userData.offline) {
            setIsOfflineMode(true);
            localStorage.setItem("isOfflineMode", "true");
          }

          completeLogin(null, "guru");
        } catch (error) {
          console.error("Error during guru login:", error);
          // Fallback to offline mode
          console.log("Mencoba fallback ke mode offline setelah error");
          handleOfflineLogin();
        }
      } else if (role === "admin") {
        try {
          console.log("Attempting admin login with username:", username);

          // Use the new adminLogin function
          const adminData = await loginAdmin(username, password);

          if (!adminData) {
            console.error("No admin data found for given credentials");
            setError("Username atau password admin salah!");
            setLoading(false);
            return;
          }

          console.log("Admin login successful with user:", adminData);

          // Store admin info in localStorage with proper structure
          const adminInfo = {
            nama: adminData.nama,
            tipe_admin: adminData.tipe_admin,
            id_admin: adminData.id_admin,
            username: username,
          };

          localStorage.setItem("userData", JSON.stringify(adminInfo));

          // If response indicates offline mode, set it
          if (adminData.offline) {
            setIsOfflineMode(true);
            localStorage.setItem("isOfflineMode", "true");
          }

          completeLogin(null, "admin");
        } catch (error) {
          console.error("Error during admin login:", error);
          // Try offline login as fallback
          console.log("Attempting fallback to offline mode after error");
          handleOfflineLogin();
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Terjadi kesalahan saat login. Silakan coba lagi atau gunakan mode offline."
      );
      setLoading(false);
      setIsOfflineMode(true);
      // Coba login offline sebagai fallback
      handleOfflineLogin();
    }
  };

  // Helper function untuk login offline
  const handleOfflineLogin = () => {
    if (role === "siswa") {
      // Siswa login dengan nama dan nis
      // username = nama siswa, password = nis
      const offlineSiswa = dummySiswa.find(
        (s) => s.nama === username && s.nis === password
      );

      if (!offlineSiswa) {
        setError("Nama atau NIS siswa salah!");
        setLoading(false);
        return;
      }

      // Tandai bahwa ini adalah data offline
      const siswaWithFlag = { ...offlineSiswa, offline: true };
      localStorage.setItem("userData", JSON.stringify(siswaWithFlag));
      localStorage.setItem("isOfflineMode", "true");
      setIsOfflineMode(true);
      setLoginSuccess(true);
    } else if (role === "guru") {
      // Guru login dengan nama dan nuptk
      // username = nama guru, password = nuptk
      const offlineGuru = dummyGuru.find(
        (g) => g.nama === username && g.nuptk === password
      );

      if (!offlineGuru) {
        setError("Nama atau NUPTK guru salah!");
        setLoading(false);
        return;
      }

      // Tandai bahwa ini adalah data offline
      const guruWithFlag = { ...offlineGuru, offline: true };
      localStorage.setItem("userData", JSON.stringify(guruWithFlag));
      localStorage.setItem("isOfflineMode", "true");
      setIsOfflineMode(true);
      completeLogin(null, "guru");
    } else if (role === "admin") {
      // Check against static admin credentials
      const adminCred = staticCredentials.admin.find(
        (admin) => admin.username === username && admin.password === password
      );

      if (adminCred) {
        const adminData = {
          nama: adminCred.nama,
          tipe_admin: adminCred.type,
          username: adminCred.username,
          offline: true,
        };
        localStorage.setItem("userData", JSON.stringify(adminData));
        localStorage.setItem("isOfflineMode", "true");
        setIsOfflineMode(true);
        completeLogin(null, "admin");
      } else {
        setError("Username atau password admin salah!");
        setLoading(false);
      }
    }
  };

  const handleAvatarSelection = async (avatar) => {
    _setSelectedAvatar(avatar);

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      if (userData && userData.id_siswa) {
        let shouldUpdateLocally = true;

        // Only try online update if we're not in offline mode
        if (!isOfflineMode) {
          try {
            const updatedUser = await updateSiswaAvatar(
              userData.id_siswa,
              avatar.name
            );
            console.log("Avatar update attempt result:", updatedUser);

            if (updatedUser && !updatedUser.error) {
              if (updatedUser.offline) {
                setIsOfflineMode(true);
                localStorage.setItem("isOfflineMode", "true");
              }
              userData.avatar = updatedUser.avatar || avatar.name;
              shouldUpdateLocally = false;
            }
          } catch (error) {
            console.error("Error updating avatar online:", error);
          }
        }

        // Update locally if online update failed or we're in offline mode
        if (shouldUpdateLocally) {
          userData.avatar = avatar.name;
        }

        localStorage.setItem("userData", JSON.stringify(userData));
      }

      completeLogin(avatar, "siswa");
    } catch (err) {
      console.error("Error during avatar selection:", err);
      // Ensure the login process continues even if there was an error
      completeLogin(avatar, "siswa");
    }
  };

  const completeLogin = (avatar, userRole) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("isOfflineMode", isOfflineMode.toString());

    if (avatar) {
      localStorage.setItem("selectedAvatar", JSON.stringify(avatar));
    }

    switch (userRole) {
      case "siswa": {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const kelas = userData.id_kelas;
        if (kelas === 1) {
          navigate("/kelas1");
        } else if (kelas === 2) {
          navigate("/kelas2");
        } else if (kelas === 3) {
          navigate("/kelas3");
        } else if (kelas === 4) {
          navigate("/kelas4");
        } else if (kelas === 5) {
          navigate("/kelas5");
        } else if (kelas === 6) {
          navigate("/kelas6");
        } else {
          navigate("/main-siswa");
        }
        break;
      }
      case "guru": {
        navigate("/guru/dashboard");
        break;
      }
      case "ortu": {
        navigate("/dashboard-ortu");
        break;
      }
      case "admin": {
        navigate("/admin/dashboard");
        break;
      }
      default:
        navigate("/");
    }
  };

  const handleBackToRoleSelection = () => {
    localStorage.removeItem("selectedRole");
    navigate("/");
  };

  const getRoleInfo = () => {
    switch (role) {
      case "siswa":
        return {
          title: "Login Siswa",
          icon: null,
        };
      case "guru":
        return {
          title: "Login Guru",
          icon: null,
        };
      case "ortu":
        return {
          title: "Login Orang Tua",
          icon: null,
        };
      case "admin":
        return {
          title: "Login Admin",
          icon: null,
        };
      default:
        return {
          title: "Login",
          icon: null,
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="login-container">
      {isOfflineMode && (
        <div className="offline-indicator">
          Mode Offline - Data login digunakan dari local storage
          <button
            className="retry-button"
            onClick={retryConnection}
            disabled={connectionChecking}
          >
            {connectionChecking ? "Memeriksa..." : "Coba Sambung Ulang"}
          </button>
        </div>
      )}
      <button
        className={`back-button role-${role}`}
        onClick={handleBackToRoleSelection}
      >
        Kembali
      </button>
      <div className={`login-box role-${role}`}>
        <div className="login-header">
          <h2>{roleInfo.title}</h2>
        </div>

        {!loginSuccess ? (
          <div className="login-form1">
            {roleInfo.icon && (
              <div className="role-icon-container">
                <img
                  src={roleInfo.icon}
                  alt={`Icon ${roleInfo.title}`}
                  className="role-icon-large"
                />
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="username">
                  {role === "siswa"
                    ? "Nama"
                    : role === "guru"
                    ? "Nama"
                    : role === "admin"
                    ? "Email"
                    : "Username"}
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete={
                    role === "siswa"
                      ? "given-name"
                      : role === "guru"
                      ? "name"
                      : role === "admin"
                      ? "email"
                      : "username"
                  }
                  placeholder={
                    role === "siswa"
                      ? "Masukkan nama"
                      : role === "guru"
                      ? "Masukkan nama"
                      : role === "ortu"
                      ? "ortu"
                      : "Masukkan email admin"
                  }
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">
                  {role === "siswa"
                    ? "Nomor Induk Siswa (NIS)"
                    : role === "guru"
                    ? "NUPTK"
                    : "Password"}
                </label>
                <input
                  type={
                    role === "siswa" || role === "guru" ? "text" : "password"
                  }
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={
                    role === "siswa"
                      ? "username"
                      : role === "guru"
                      ? "username"
                      : "current-password"
                  }
                  placeholder={
                    role === "siswa"
                      ? "Masukkan NIS"
                      : role === "guru"
                      ? "Masukkan NUPTK"
                      : role === "ortu"
                      ? "ortu123"
                      : "Masukkan password"
                  }
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>
          </div>
        ) : (
          <div className="avatar-selection">
            <h3>Pilih Avatar Kamu!</h3>
            <div className="avatar-grid">
              {avatarOptions.map((avatar, index) => (
                <motion.div
                  key={index}
                  className="avatar-option"
                  onClick={() => handleAvatarSelection(avatar)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img src={avatar.src} alt={avatar.name} />
                  <p>{avatar.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
