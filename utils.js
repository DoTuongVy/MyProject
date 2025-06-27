//! =================================================================
//! ĐIỀU HƯỚNG TRANG
//  Mô tả: Các hàm điều hướng trang theo vai trò
//! =================================================================

//TODO Chuyển hướng về trang chủ theo vai trò==============================================
function navigateToHome() {
  // Lấy thông tin người dùng hiện tại
  const currentUser = getCurrentUser();
  
  // Luôn chuyển về /user (admin cũng có thể truy cập /user)
  window.location.href = '/user';
}

//TODO Thiết lập điều hướng trang chủ==============================================
function setupHomeNavigation() {
  // Tìm tất cả các nút "Trang chủ" theo nhiều dạng phổ biến
  const homeButtons = document.querySelectorAll('a[href="/user"], a.home-link, a.btn-home, button.home-btn');
  
  homeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToHome();
    });
  });
  
  // Gán sự kiện cho nút Trang chủ trong header (nếu có)
  const homeLink = document.getElementById('home-link');
  if (homeLink) {
    homeLink.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToHome();
    });
  }
}







//! =================================================================
//! XỬ LÝ DỮ LIỆU HỆ THỐNG
//  Mô tả: Sửa lỗi dữ liệu hệ thống
//! =================================================================

//TODO Sửa hệ thống trùng lặp======================================================
async function fixDuplicateSystems() {
  console.log('Đang kiểm tra và sửa hệ thống trùng lặp...');
  
  try {
    // Tìm các hệ thống trùng lặp
    const duplicates = await db.allAsync(`
      SELECT name, COUNT(*) as count 
      FROM systems 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);
    
    console.log(`Tìm thấy ${duplicates.length} tên hệ thống trùng lặp`);
    
    // Xử lý từng trường hợp trùng lặp
    for (const dup of duplicates) {
      console.log(`Xử lý hệ thống: ${dup.name}`);
      
      // Lấy tất cả bản ghi của hệ thống này
      const systems = await db.allAsync(`
        SELECT * FROM systems WHERE name = ? ORDER BY created_at DESC
      `, [dup.name]);
      
      // Giữ lại bản ghi đầu tiên (mới nhất)
      const keepSystem = systems[0];
      const deleteIds = systems.slice(1).map(s => s.id);
      
      console.log(`Giữ lại ID=${keepSystem.id}, xóa ${deleteIds.length} bản sao`);
      
      // Cập nhật các module thuộc các hệ thống cũ
      for (const oldId of deleteIds) {
        await db.runAsync(`
          UPDATE modules SET system_id = ? WHERE system_id = ?
        `, [keepSystem.id, oldId]);
        
        console.log(`Đã cập nhật modules từ system_id=${oldId} sang ${keepSystem.id}`);
      }
      
      // Xóa các hệ thống trùng lặp
      if (deleteIds.length > 0) {
        const placeholders = deleteIds.map(() => '?').join(',');
        await db.runAsync(`
          DELETE FROM systems WHERE id IN (${placeholders})
        `, deleteIds);
        
        console.log(`Đã xóa ${deleteIds.length} hệ thống trùng lặp`);
      }
    }
    
    console.log('Hoàn tất sửa hệ thống trùng lặp');
    
  } catch (error) {
    console.error('Lỗi khi sửa hệ thống trùng lặp:', error);
  }
}





//! =================================================================
//! KIỂM TRA ĐĂNG NHẬP & PHÂN QUYỀN
//  Mô tả: Kiểm tra trạng thái đăng nhập và quyền truy cập
//! =================================================================

//TODO Hiển thị thông báo không có quyền truy cập=====================================================
function showAccessDenied() {
  // Tìm phần tử main content
  const mainContent = document.querySelector('main') || document.querySelector('.content') || document.querySelector('.container');
  
  if (mainContent) {
      // Lưu lại nội dung gốc
      mainContent.dataset.originalContent = mainContent.innerHTML;
      
      // Hiển thị thông báo không có quyền
      mainContent.innerHTML = `
          <div class="access-denied" style="text-align: center; padding: 50px 20px; max-width: 600px; margin: 50px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="margin-bottom: 20px; color: #e74c3c; font-size: 24px;">Không có quyền truy cập</h2>
              <p style="margin-bottom: 30px; color: #666; line-height: 1.6;">Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
              <button id="denied-logout-btn" style="padding: 10px 25px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Đăng xuất</button>
          </div>
      `;
      
      // Thêm sự kiện cho nút đăng xuất
      document.getElementById('denied-logout-btn').addEventListener('click', logout);
  }
}







//! =================================================================
//! QUẢN LÝ THÔNG TIN NGƯỜI DÙNG
//  Mô tả: Lấy và hiển thị thông tin người dùng
//! =================================================================

//todo Lấy thông tin người dùng hiện tại từ session storage=====================================================
function getCurrentUser() {
  const userString = sessionStorage.getItem('currentUser');
  return userString ? JSON.parse(userString) : null;
}

//todo Lấy quyền truy cập từ session storage=====================================================
function getUserPermissions() {
  const permissionsString = sessionStorage.getItem('userPermissions');
  return permissionsString ? JSON.parse(permissionsString) : null;
}








//! ====================================================================================================================================
//! =================================================================
//! TIỆN ÍCH & HÀM HỖ TRỢ
//  Mô tả: Các hàm tiện ích để thao tác DOM an toàn và hiển thị thông báo
//! =================================================================

//TODO Thêm một hàm hỗ trợ để kiểm tra xem một element có tồn tại không========================================================================
function elementExists(id) {
  return document.getElementById(id) !== null;
}

//TODO Hiển thị thông báo toast========================================================
function showToast(message, type = 'success') {
  const toast = safeGetElement('notification-toast');
  if (!toast) {
    console.warn('Toast element not found, message:', message);
    return;
  }
  
  const toastMessage = safeGetElement('toast-message');
  if (toastMessage) {
    toastMessage.textContent = message;
  }
  
  const toastIcon = toast.querySelector('.toast-icon i');
  if (toastIcon) {
    if (type === 'error') {
      toast.className = 'toast error';
      toastIcon.className = 'fas fa-times-circle';
    } else {
      toast.className = 'toast';
      toastIcon.className = 'fas fa-check-circle';
    }
  }
  
  // Show toast
  toast.style.display = 'flex';
  
  // Auto-hide after 3 seconds
  setTimeout(hideToast, 3000);
}

//TODO Ẩn thông báo========================================================================
function hideToast() {
  const toast = safeGetElement('notification-toast');
  if (toast) {
    toast.style.display = 'none';
  }
}

//TODO Safe DOM manipulation helper functions========================================================================
function safeGetElement(id) {
  return document.getElementById(id);
}

function safeQuerySelector(selector) {
  return document.querySelector(selector);
}

function safeQuerySelectorAll(selector) {
  return document.querySelectorAll(selector);
}



//TODO Format ngày tháng========================================================================
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

//TODO Lấy element an toàn========================================================================
function safeGetElement(id) {
  return document.getElementById(id);
}

// Load admin sticky bar script
(function() {
  const script = document.createElement('script');
  script.src = '/admin-module-sticky.js';
  document.head.appendChild(script);
})();




  
  
  // Gọi hàm này khi trang đã tải xong
  document.addEventListener('DOMContentLoaded', function() {
    setupHomeNavigation();
  });


