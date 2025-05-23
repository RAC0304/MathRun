import React from 'react';
import './EditStudentModal.css'; // Menggunakan style yang sama dengan modal lain

const KelasModal = ({ 
  isOpen, 
  onClose, 
  student, 
  availableClasses, 
  onConfirm, 
  type // 'naik' atau 'pindah'
}) => {
  if (!isOpen) return null;

  const handleSelect = (targetClass) => {
    const message = type === 'naik' 
      ? `Apakah Anda yakin ingin menaikkan ${student.name} ke ${targetClass}?`
      : `Apakah Anda yakin ingin memindahkan ${student.name} ke ${targetClass}?`;

    if (window.confirm(message)) {
      onConfirm(targetClass);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h2>
            {type === 'naik' ? 'Naik Kelas' : 'Pindah Kelas'} - {student.name}
          </h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ padding: '20px' }}>
          <p style={{ marginBottom: '15px' }}>
            {type === 'naik' 
              ? 'Pilih kelas tujuan untuk kenaikan kelas:' 
              : 'Pilih kelas tujuan untuk pindah kelas:'}
          </p>
          <div className="class-options" style={{ display: 'grid', gap: '10px' }}>
            {availableClasses.map((kelas) => (
              <button
                key={kelas}
                onClick={() => handleSelect(kelas)}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#fff';
                }}
              >
                {kelas}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid #eee' }}>
          <button 
            onClick={onClose}
            className="cancel-button"
            style={{
              padding: '8px 15px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#6c757d',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default KelasModal;