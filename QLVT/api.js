// API Service for Phieu Sang Cuon & Phieu Cat
const API_URL = '/api';

// Hàm tiện ích để xử lý lỗi và hiển thị thông báo chi tiết
function handleApiError(error, defaultMessage) {
  console.error(defaultMessage, error);
  
  // Cố gắng trích xuất thông báo lỗi chi tiết nếu có
  let errorMessage = defaultMessage;
  
  if (error.response) {
    // Nếu có response từ server
    try {
      const errorData = error.response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // Nếu không phân tích được JSON, sử dụng statusText
      errorMessage = error.response.statusText || defaultMessage;
    }
  } else if (error.message) {
    // Nếu lỗi có thuộc tính message
    errorMessage = error.message;
  }
  
  return errorMessage;
}

// Phiếu Sang Cuộn API
const PhieuSangCuonAPI = {
  // Lấy danh sách phiếu sang cuộn
  async getList() {
    try {
      const response = await fetch(`${API_URL}/sang-cuon/list`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiếu sang cuộn:', error);
      return [];
    }
  },

  // Lấy danh sách phiếu formula sang cuộn
  async getFormula() {
    try {
      const response = await fetch(`${API_URL}/sang-cuon/formula`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách formula sang cuộn:', error);
      return [];
    }
  },

  // Thêm phiếu sang cuộn mới
  async add(phieu) {
    try {
      // Đảm bảo phiếu có id
      if (!phieu.id) {
        phieu.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      }
      
      // Chuẩn hóa ngày tháng
      if (phieu.ngayCT) {
        // Chuyển đổi từ dd/mm/yyyy sang yyyy-mm-dd nếu cần
        const parts = phieu.ngayCT.split('/');
        if (parts.length === 3) {
          phieu.ngayCT = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      
      // Đảm bảo mỗi phiếu có ít nhất một mã hàng nhập
      if (!phieu.maNhaps || !Array.isArray(phieu.maNhaps) || phieu.maNhaps.length === 0) {
        phieu.maNhaps = [{
          sttNhap: "1",
          maHangNhap: "",
          slNhap: "",
          tlNhap: ""
        }];
      }
      
      // Đảm bảo các trường số dạng string
      ['slXuat', 'tlXuat', 'tonSL', 'tonTL', 'tonTT'].forEach(field => {
        if (phieu[field] !== undefined && phieu[field] !== null) {
          phieu[field] = String(phieu[field]);
        }
      });
      
      phieu.maNhaps.forEach(maNhap => {
        ['slNhap', 'tlNhap'].forEach(field => {
          if (maNhap[field] !== undefined && maNhap[field] !== null) {
            maNhap[field] = String(maNhap[field]);
          }
        });
      });

      const response = await fetch(`${API_URL}/sang-cuon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(phieu),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Không thể thêm phiếu sang cuộn');
      throw new Error(errorMessage);
    }
  },

  // Cập nhật phiếu sang cuộn
  async update(id, phieu) {
    try {
      // Chuẩn hóa ngày tháng
      if (phieu.ngayCT) {
        // Chuyển đổi từ dd/mm/yyyy sang yyyy-mm-dd nếu cần
        const parts = phieu.ngayCT.split('/');
        if (parts.length === 3) {
          phieu.ngayCT = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      
      // Đảm bảo các trường số dạng string
      ['slXuat', 'tlXuat', 'tonSL', 'tonTL', 'tonTT'].forEach(field => {
        if (phieu[field] !== undefined && phieu[field] !== null) {
          phieu[field] = String(phieu[field]);
        }
      });
      
      if (phieu.maNhaps && Array.isArray(phieu.maNhaps)) {
        phieu.maNhaps.forEach(maNhap => {
          ['slNhap', 'tlNhap'].forEach(field => {
            if (maNhap[field] !== undefined && maNhap[field] !== null) {
              maNhap[field] = String(maNhap[field]);
            }
          });
        });
      }

      const response = await fetch(`${API_URL}/sang-cuon/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(phieu),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Không thể cập nhật phiếu sang cuộn');
      throw new Error(errorMessage);
    }
  },

  // Xóa phiếu sang cuộn
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/sang-cuon/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Không thể xóa phiếu sang cuộn');
      throw new Error(errorMessage);
    }
  },

  // Xóa nhiều phiếu sang cuộn
  async deleteMultiple(ids) {
    try {
      const response = await fetch(`${API_URL}/sang-cuon/delete-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Không thể xóa nhiều phiếu sang cuộn');
      throw new Error(errorMessage);
    }
  },

  // Tìm kiếm phiếu sang cuộn
  async search(keyword) {
    try {
      const response = await fetch(`${API_URL}/sang-cuon/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi tìm kiếm phiếu sang cuộn:', error);
      return [];
    }
  },
};

// Phiếu Cắt API
const PhieuCatAPI = {
  // Lấy danh sách phiếu cắt
  async getList() {
    try {
      const response = await fetch(`${API_URL}/cat/list`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiếu cắt:', error);
      return [];
    }
  },

  // Lấy danh sách phiếu formula cắt
  async getFormula() {
    try {
      const response = await fetch(`${API_URL}/cat/formula`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách formula cắt:', error);
      return [];
    }
  },

  // Thêm phiếu cắt mới
  async add(phieu) {
    try {
      // Đảm bảo phiếu có id
      if (!phieu.id) {
        phieu.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      }
      
      // Chuẩn hóa ngày tháng
      if (phieu.ngayCT) {
        // Chuyển đổi từ dd/mm/yyyy sang yyyy-mm-dd nếu cần
        const parts = phieu.ngayCT.split('/');
        if (parts.length === 3) {
          phieu.ngayCT = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      
      // Đảm bảo các trường số dạng string
      ['slDat', 'dinhLuong', 'soTam', 'soCon', 'khoCat', 'daiCat', 'khoXen', 'daiXen', 
       'soLanXen', 'tlDuKien', 'tonSL', 'tonTL', 'tonTT'].forEach(field => {
        if (phieu[field] !== undefined && phieu[field] !== null) {
          phieu[field] = String(phieu[field]);
        }
      });

      const response = await fetch(`${API_URL}/cat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(phieu),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Không thể thêm phiếu cắt');
      throw new Error(errorMessage);
    }
  },

  // Cập nhật phiếu cắt
  async update(id, phieu) {
    try {
      // Chuẩn hóa ngày tháng
      if (phieu.ngayCT) {
        // Chuyển đổi từ dd/mm/yyyy sang yyyy-mm-dd nếu cần
        const parts = phieu.ngayCT.split('/');
        if (parts.length === 3) {
          phieu.ngayCT = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      
      // Đảm bảo các trường số dạng string
      ['slDat', 'dinhLuong', 'soTam', 'soCon', 'khoCat', 'daiCat', 'khoXen', 'daiXen', 
       'soLanXen', 'tlDuKien', 'tonSL', 'tonTL', 'tonTT'].forEach(field => {
        if (phieu[field] !== undefined && phieu[field] !== null) {
          phieu[field] = String(phieu[field]);
        }
      });

      const response = await fetch(`${API_URL}/cat/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(phieu),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Không thể cập nhật phiếu cắt');
      throw new Error(errorMessage);
    }
  },

  // Xóa phiếu cắt
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/cat/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Không thể xóa phiếu cắt');
      throw new Error(errorMessage);
    }
  },

  // Xóa nhiều phiếu cắt
  async deleteMultiple(ids) {
    try {
      const response = await fetch(`${API_URL}/cat/delete-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Lỗi từ server: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = handleApiError(error, 'Không thể xóa nhiều phiếu cắt');
      throw new Error(errorMessage);
    }
  },

  // Tìm kiếm phiếu cắt
  async search(keyword) {
    try {
      const response = await fetch(`${API_URL}/cat/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi tìm kiếm phiếu cắt:', error);
      return [];
    }
  },
};

// Export các API service
window.PhieuSangCuonAPI = PhieuSangCuonAPI;
window.PhieuCatAPI = PhieuCatAPI;