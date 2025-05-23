import supabase from './config/supabase';
import { updateSiswaAvatar } from './services/database';

console.log('============ DEBUG SUPABASE ============');
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey ? 'Key tersedia' : 'Key tidak tersedia');
console.log('Supabase Methods:', Object.keys(supabase));

// Tes koneksi
const testConnection = async () => {
  try {
    console.log('Menguji koneksi Supabase...');
    const isConnected = await supabase.testConnection(5000);
    console.log('Status koneksi:', isConnected ? 'TERHUBUNG' : 'TIDAK TERHUBUNG');
    return isConnected;
  } catch (error) {
    console.error('Error saat menguji koneksi:', error);
    return false;
  }
};

// Debug fungsi from
const testFromMethod = async () => {
  try {
    console.log('\n--- Testing from() method ---');
    if (typeof supabase.from !== 'function') {
      console.error('ERROR: supabase.from bukan fungsi!');
      return false;
    }
    
    const siswaTable = supabase.from('siswa');
    console.log('siswaTable methods:', Object.keys(siswaTable));
    return true;
  } catch (error) {
    console.error('Error pada from:', error);
    return false;
  }
};

// Debug fungsi select
const testSelectMethod = async () => {
  try {
    console.log('\n--- Testing select() method ---');
    const siswaTable = supabase.from('siswa');
    if (typeof siswaTable.select !== 'function') {
      console.error('ERROR: siswaTable.select bukan fungsi!');
      return false;
    }
    
    const query = siswaTable.select('*');
    console.log('query methods:', Object.keys(query));
    return true;
  } catch (error) {
    console.error('Error pada select:', error);
    return false;
  }
};

// Debug fungsi eq
const testEqMethod = async () => {
  try {
    console.log('\n--- Testing eq() method ---');
    const query = supabase.from('siswa').select('*');
    if (typeof query.eq !== 'function') {
      console.error('ERROR: query.eq bukan fungsi!');
      return false;
    }
    
    const filtered = query.eq('id_siswa', 1);
    console.log('filtered methods:', Object.keys(filtered));
    return true;
  } catch (error) {
    console.error('Error pada eq:', error);
    return false;
  }
};

// Debug fungsi update
const testUpdateMethod = async () => {
  try {
    console.log('\n--- Testing update() method ---');
    const siswaTable = supabase.from('siswa');
    if (typeof siswaTable.update !== 'function') {
      console.error('ERROR: siswaTable.update bukan fungsi!');
      return false;
    }
    
    console.log('update method tersedia');
    return true;
  } catch (error) {
    console.error('Error pada update:', error);
    return false;
  }
};

// Debug dengan fetch API langsung
const testFetchAPI = async () => {
  try {
    console.log('\n--- Testing Fetch API ---');
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/siswa?select=*&limit=1`, {
      headers: {
        'apikey': supabase.supabaseKey,
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Fetch API error:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('Fetch API result:', data.length > 0 ? 'Data ditemukan' : 'Tidak ada data');
    if (data.length > 0) {
      console.log('Sample data:', data[0]);
    }
    return true;
  } catch (error) {
    console.error('Fetch API exception:', error);
    return false;
  }
};

// Tes update avatar
const testUpdateAvatar = async (id_siswa, avatar) => {
  try {
    console.log(`\n--- Testing Update Avatar (ID: ${id_siswa}, Avatar: ${avatar}) ---`);
    
    // Gunakan fungsi updateSiswaAvatar
    const result = await updateSiswaAvatar(id_siswa, avatar);
    
    if (result) {
      console.log('Update avatar berhasil:', result);
      return true;
    } else {
      console.log('Update avatar gagal, tidak ada data yang dikembalikan');
      return false;
    }
  } catch (error) {
    console.error('Error saat update avatar:', error);
    return false;
  }
};

// Tes login siswa
const testLoginSiswa = async (nama, nis) => {
  try {
    console.log(`\n--- Testing Login Siswa (${nama}, ${nis}) ---`);
    
    // Coba dengan metode Supabase client
    try {
      console.log('Mencoba dengan metode Supabase client...');
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .eq('nama', nama)
        .eq('nis', nis)
        .single();
      
      if (error) {
        console.error('Error dengan metode Supabase client:', error);
      } else {
        console.log('Login berhasil dengan Supabase client:', data ? 'Data ditemukan' : 'Tidak ada data');
      }
    } catch (clientError) {
      console.error('Exception dengan Supabase client:', clientError);
    }
    
    // Coba dengan fetch API
    try {
      console.log('Mencoba dengan fetch API...');
      const url = `${supabase.supabaseUrl}/rest/v1/siswa?select=*&nama=eq.${encodeURIComponent(nama)}&nis=eq.${encodeURIComponent(nis)}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        return false;
      }
      
      const data = await response.json();
      console.log('Fetch API result:', data.length > 0 ? 'Data ditemukan' : 'Tidak ada data');
      if (data.length > 0) {
        console.log('Data siswa:', data[0]);
        return true;
      }
    } catch (fetchError) {
      console.error('Exception dengan fetch API:', fetchError);
    }
    
    return false;
  } catch (error) {
    console.error('Error saat tes login siswa:', error);
    return false;
  }
};

// Jalankan semua tes
const runAllTests = async () => {
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('GAGAL: Koneksi ke Supabase tidak berhasil!');
    return;
  }
  
  const fromMethodOk = await testFromMethod();
  const selectMethodOk = await testSelectMethod();
  const eqMethodOk = await testEqMethod();
  const updateMethodOk = await testUpdateMethod();
  const fetchApiOk = await testFetchAPI();
  
  console.log('\n============ HASIL TES ============');
  console.log('Koneksi Supabase:', connectionOk ? '✅ OK' : '❌ GAGAL');
  console.log('Metode from():', fromMethodOk ? '✅ OK' : '❌ GAGAL');
  console.log('Metode select():', selectMethodOk ? '✅ OK' : '❌ GAGAL');
  console.log('Metode eq():', eqMethodOk ? '✅ OK' : '❌ GAGAL');
  console.log('Metode update():', updateMethodOk ? '✅ OK' : '❌ GAGAL');
  console.log('Fetch API:', fetchApiOk ? '✅ OK' : '❌ GAGAL');
  
  // Tes login dengan data sampel
  console.log('\nTes login dengan data sampel:');
  await testLoginSiswa('Rudi Hartono', '2023001');
  
  // Tes update avatar dengan ID siswa 1 dan avatar "Kucing"
  console.log('\nTes update avatar:');
  await testUpdateAvatar(1, 'Kucing');
};

// Jalankan semua tes
runAllTests();
