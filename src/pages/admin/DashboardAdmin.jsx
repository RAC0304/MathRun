import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../config/supabase";
import "./admin.css";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState({
    siswa: [],
    guru: [],
    wali: [],
    admin: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("siswa");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    no_telp: "",
    nis: "",
    nuptk: "",
    id_kelas: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);
  // Update fetchUsers to use proper error handling
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch data from individual tables
      const [siswaResult, guruResult, waliResult, adminResult] = await Promise.all([
        supabase.from("siswa").select("*"),
        supabase.from("guru").select("*"),
        supabase.from("wali").select("*"),
        supabase.from("admin").select("*")
      ]);

      // Check for errors
      if (siswaResult.error) throw new Error(`Error fetching siswa: ${siswaResult.error.message}`);
      if (guruResult.error) throw new Error(`Error fetching guru: ${guruResult.error.message}`);
      if (waliResult.error) throw new Error(`Error fetching wali: ${waliResult.error.message}`);
      if (adminResult.error) throw new Error(`Error fetching admin: ${adminResult.error.message}`);

      // Update state with the fetched data
      setUsers({
        siswa: siswaResult.data || [],
        guru: guruResult.data || [],
        wali: waliResult.data || [],
        admin: adminResult.data || []
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error fetching users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    }
  };
  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna ini?`))
      return;

    try {
      let tableName;
      let idColumn;
      
      // Map role to correct table name and ID column
      if (role === "siswa") {
        tableName = "siswa";
        idColumn = "id_siswa";
      } else if (role === "guru") {
        tableName = "guru";
        idColumn = "id_guru";
      } else if (role === "wali") {
        tableName = "wali";
        idColumn = "id_wali";
      } else {
        throw new Error("Unknown role");
      }
      
      // Delete from appropriate table
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idColumn, id);

      if (error) throw error;

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user: " + error.message);
    }
  };  const handleCreateUser = async () => {
    try {
      const table = activeTab;
      let idColumn;
      let uniqueFields = {};

      switch (activeTab) {
        case 'siswa':
          idColumn = 'id_siswa';
          uniqueFields = { nis: formData.nis };
          break;
        case 'guru':
          idColumn = 'id_guru';
          uniqueFields = { nuptk: formData.nuptk };
          break;
        case 'wali':
          idColumn = 'id_wali';
          uniqueFields = { email: formData.email };
          break;
        case 'admin':
          idColumn = 'id_admin';
          uniqueFields = { email: formData.email };
          break;
        default:
          throw new Error('Invalid user type');
      }

      // Check if user with unique fields already exists
      const { data: existingUser } = await supabase
        .from(table)
        .select()
        .match(uniqueFields)
        .single();

      if (existingUser) {
        throw new Error(`${activeTab} dengan ${Object.keys(uniqueFields)[0]} tersebut sudah ada`);
      }

      // Insert new user
      const { data, error } = await supabase
        .from(table)
        .insert([formData])
        .select();

      if (error) throw error;

      setUsers(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], data[0]]
      }));

      setModalOpen(false);
      setFormData(initialFormState);
      alert('Pengguna berhasil ditambahkan!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.message);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const table = activeTab;
      let idColumn;

      switch (activeTab) {
        case 'siswa':
          idColumn = 'id_siswa';
          break;
        case 'guru':
          idColumn = 'id_guru';
          break;
        case 'wali':
          idColumn = 'id_wali';
          break;
        case 'admin':
          idColumn = 'id_admin';
          break;
        default:
          throw new Error('Invalid user type');
      }

      const { error } = await supabase
        .from(table)
        .update(formData)
        .eq(idColumn, selectedUser[idColumn]);

      if (error) throw error;

      setUsers(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(user => 
          user[idColumn] === selectedUser[idColumn] ? { ...user, ...formData } : user
        )
      }));

      setModalOpen(false);
      setEditMode(false);
      setSelectedUser(null);
      setFormData(initialFormState);
      alert('Pengguna berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      nama: user.nama || '',
      email: user.email || '',
      no_telp: user.no_telp || '',
      nis: user.nis || '',
      nuptk: user.nuptk || '',
      id_kelas: user.id_kelas || '',
      tanggal_lahir: user.tanggal_lahir || '',
      jenis_kelamin: user.jenis_kelamin || '',
      alamat: user.alamat || ''
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const initialFormState = {
    nama: "",
    email: "",
    password: "",
    no_telp: "",
    nis: "",
    nuptk: "",
    id_kelas: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: ""
  };

  const renderModal = () => (
    <div className={`modal ${modalOpen ? 'show' : ''}`}>
      <div className="modal-content">
        <h2>{editMode ? 'Edit' : 'Tambah'} {activeTab}</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          editMode ? handleUpdateUser() : handleCreateUser();
        }}>
          <div className="form-group">
            <label>Nama:</label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          {!editMode && (
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>No. Telepon:</label>
            <input
              type="tel"
              value={formData.no_telp}
              onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
            />
          </div>
          {activeTab === 'siswa' && (
            <>
              <div className="form-group">
                <label>NIS:</label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kelas:</label>
                <input
                  type="number"
                  value={formData.id_kelas}
                  onChange={(e) => setFormData({ ...formData, id_kelas: e.target.value })}
                  required
                />
              </div>
            </>
          )}
          {activeTab === 'guru' && (
            <div className="form-group">
              <label>NUPTK:</label>
              <input
                type="text"
                value={formData.nuptk}
                onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Tanggal Lahir:</label>
            <input
              type="date"
              value={formData.tanggal_lahir}
              onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Jenis Kelamin:</label>
            <select
              value={formData.jenis_kelamin}
              onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div className="form-group">
            <label>Alamat:</label>
            <textarea
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="submit">{editMode ? 'Update' : 'Simpan'}</button>
            <button type="button" onClick={() => {
              setModalOpen(false);
              setEditMode(false);
              setSelectedUser(null);
              setFormData(initialFormState);
            }}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderUserTable = () => {
    const currentUsers = users[activeTab] || [];

    if (loading) {
      return <div className="loading">Loading users...</div>;
    }

    if (currentUsers.length === 0) {
      return (
        <div className="no-users">
          Tidak ada pengguna {activeTab} yang terdaftar.
        </div>
      );
    }

    return (
      <>
        <div className="table-actions">
          <button onClick={() => {
            setEditMode(false);
            setSelectedUser(null);
            setFormData(initialFormState);
            setModalOpen(true);
          }}>
            Tambah {activeTab}
          </button>
        </div>
        <table className="user-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              {activeTab === "siswa" && <th>NIS</th>}
              {activeTab === "guru" && <th>NUPTK</th>}
              <th>No. Telepon</th>
              {activeTab === "siswa" && <th>Kelas</th>}
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => {
              const userId = activeTab === "siswa" ? user.id_siswa : 
                           activeTab === "guru" ? user.id_guru : 
                           activeTab === "wali" ? user.id_wali : user.id_admin;
              return (
                <tr key={userId}>
                  <td>{user.nama}</td>
                  <td>{user.email}</td>
                  {activeTab === "siswa" && <td>{user.nis}</td>}
                  {activeTab === "guru" && <td>{user.nuptk}</td>}
                  <td>{user.no_telp}</td>
                  {activeTab === "siswa" && <td>{user.id_kelas}</td>}
                  <td>
                    <button className="edit-button" onClick={() => handleEditUser(user)}>
                      Edit
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteUser(userId, activeTab)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h1>Dashboard Admin</h1>

        <div className="admin-actions">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "siswa" ? "active" : ""}`}
            onClick={() => setActiveTab("siswa")}
          >
            Siswa ({users.siswa.length})
          </button>
          <button
            className={`tab ${activeTab === "guru" ? "active" : ""}`}
            onClick={() => setActiveTab("guru")}
          >
            Guru ({users.guru.length})
          </button>
          <button
            className={`tab ${activeTab === "wali" ? "active" : ""}`}
            onClick={() => setActiveTab("wali")}
          >
            Orang Tua ({users.wali.length})
          </button>
          <button
            className={`tab ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            Admin ({users.admin?.length || 0})
          </button>
        </div>

        <div className="users-container">
          {renderUserTable()}
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default DashboardAdmin;
