//! =================================================================
//! AUTHENTICATION FUNCTIONS
//  Mô tả: Các hàm xác thực người dùng
//! =================================================================

//TODO Lấy thông tin người dùng hiện tại từ session storage
function getCurrentUser() {
  const userString = sessionStorage.getItem('currentUser');
  return userString ? JSON.parse(userString) : null;
}

//TODO Lấy quyền truy cập từ session storage  
function getUserPermissions() {
  const permissionsString = sessionStorage.getItem('userPermissions');
  return permissionsString ? JSON.parse(permissionsString) : null;
}







//! =================================================================
//! KHỞI TẠO TRANG NGƯỜI DÙNG
//  Mô tả: Khởi tạo trang người dùng, kiểm tra đăng nhập
//! =================================================================


// Đánh dấu đây là giao diện user
window.isUserInterface = true;



//TODO Khởi tạo trang khi DOM đã load xong===============================================
document.addEventListener('DOMContentLoaded', function() {
  
  
  // Kiểm tra đăng nhập cho user (không yêu cầu quyền admin)
  function checkUserAuthentication() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
      window.location.href = '/login/login.html';
      return false;
    }
    
    // THÊM DÒNG NÀY: Tạo header cho user interface
    createUserHeader(currentUser);

    // Đảm bảo không có xung đột event listener đăng xuất
setTimeout(() => {
  const logoutBtns = document.querySelectorAll('#logout-btn, #user-logout-btn');
  logoutBtns.forEach(btn => {
      // Xóa tất cả event listeners cũ
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Gán event listener mới
      newBtn.addEventListener('click', function() {
          // Kiểm tra xem đã có confirm dialog nào đang hiển thị không
          if (window.logoutInProgress) {
              return;
          }
          
          window.logoutInProgress = true;
          
          if (confirm('Đăng xuất sẽ xóa hết dữ liệu lưu trữ. Bạn có chắc chắn muốn đăng xuất?')) {
              // Xóa thông tin đăng nhập
              sessionStorage.removeItem('currentUser');
              sessionStorage.removeItem('userPermissions');

              // Xóa tất cả dữ liệu form GMC đã lưu
              const keysToRemove = [];
              for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('gmcFormData_machine_')) {
                      keysToRemove.push(key);
                  }
              }
              keysToRemove.forEach(key => localStorage.removeItem(key));
              
              // Chuyển hướng đến trang đăng nhập
              window.location.href = '/login/login.html';
          } else {
              window.logoutInProgress = false;
          }
      });
  });
}, 100);

    
    // User đã đăng nhập - cho phép truy cập
    return true;
  }

// Gọi hàm kiểm tra
if (!checkUserAuthentication()) {
  return;
}




  
  // Hiển thị thông tin người dùng
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = currentUser.fullname || currentUser.username || currentUser.employee_id || 'Người dùng';
  }
  
  // Ensure we start in systems view, not modules view
  const systemsView = document.getElementById('systems-view');
  const modulesView = document.getElementById('modules-view');
  
  if (systemsView) systemsView.style.display = 'block';
  if (modulesView) modulesView.style.display = 'none';
  
  // Sự kiện đăng xuất
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Hiển thị xác nhận trước khi đăng xuất
      if (confirm('Đăng xuất sẽ xóa hết dữ liệu lưu trữ. Bạn có chắc chắn muốn đăng xuất?')) {
          // Xóa thông tin đăng nhập
          sessionStorage.removeItem('currentUser');
          sessionStorage.removeItem('userPermissions');
  
          // Xóa tất cả dữ liệu form GMC đã lưu
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('gmcFormData_machine_')) {
                  keysToRemove.push(key);
              }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Chuyển hướng đến trang đăng nhập
          window.location.href = '/login/login.html';
      }
  });
  }
  
  // Sự kiện quay lại danh sách hệ thống
  const backBtn = document.getElementById('back-to-systems');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (systemsView) systemsView.style.display = 'block';
      if (modulesView) modulesView.style.display = 'none';
    });
  }


  // Sự kiện đóng modal chọn máy
const closeUserMachineModal = document.getElementById('user-close-machine-modal');
if (closeUserMachineModal) {
    closeUserMachineModal.addEventListener('click', function() {
        document.getElementById('user-machine-modal').style.display = 'none';
    });
}

// Sự kiện tìm kiếm máy
const userMachineSearch = document.getElementById('user-machine-search');
if (userMachineSearch) {
    userMachineSearch.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        loadUserMachines(searchTerm);
    });
}

// Sự kiện quản lý máy (chỉ cho admin)
const userManageMachinesBtn = document.getElementById('user-manage-machines-btn');
if (userManageMachinesBtn) {
    userManageMachinesBtn.addEventListener('click', function() {
        // Đảm bảo có module hiện tại
        if (!currentUserModule) {
            alert('Vui lòng chọn module trước!');
            return;
        }
        
        // Đồng bộ currentAdminModule qua window object
        window.currentAdminModule = currentUserModule;
        
        // Đợi một chút để đảm bảo biến được gán
        setTimeout(() => {
            if (typeof window.openAdminMachineManagementModal === 'function') {
                window.openAdminMachineManagementModal(currentUserModule.id, currentUserModule.system_id);
            } else {
                alert('Chức năng quản lý máy chưa sẵn sàng!');
            }
        }, 100);
    });
}

// Đóng modal khi click outside
window.addEventListener('click', function(event) {
    const userMachineModal = document.getElementById('user-machine-modal');
    if (event.target === userMachineModal) {
        userMachineModal.style.display = 'none';
    }
});




// Sự kiện đóng modal quản lý người dùng sản xuất
const closeProductionUserModal = document.getElementById('close-production-user-modal');
const closeProductionUserBtn = document.getElementById('close-production-user-btn');

if (closeProductionUserModal) {
    closeProductionUserModal.addEventListener('click', function() {
        document.getElementById('production-user-modal').style.display = 'none';
    });
}

if (closeProductionUserBtn) {
    closeProductionUserBtn.addEventListener('click', function() {
        document.getElementById('production-user-modal').style.display = 'none';
    });
}

// Đóng modal khi click outside
window.addEventListener('click', function(event) {
    const productionUserModal = document.getElementById('production-user-modal');
    if (event.target === productionUserModal) {
        productionUserModal.style.display = 'none';
    }
});




// Sự kiện đóng modal quản lý máy
setTimeout(() => {
  // Sự kiện đóng modal quản lý máy
  const closeAdminManageMachinesModal = document.getElementById('admin-close-manage-machines-modal');
  if (closeAdminManageMachinesModal) {
      closeAdminManageMachinesModal.addEventListener('click', function() {
          const modal = document.getElementById('admin-manage-machines-modal');
          if (modal) modal.style.display = 'none';
      });
  }

  // Sự kiện tìm kiếm trong quản lý máy
  const adminManageMachineSearch = document.getElementById('admin-manage-machine-search');
  if (adminManageMachineSearch) {
      adminManageMachineSearch.addEventListener('input', function() {
          const searchTerm = this.value.trim();
          const moduleId = currentUserModule ? currentUserModule.id : null;
          
          if (typeof window.loadAdminMachinesForManagement === 'function') {
              window.loadAdminMachinesForManagement(searchTerm, moduleId);
          }
      });
  }

  // Sự kiện thêm máy mới
  const adminAddMachineBtn = document.getElementById('admin-add-machine-btn');
  if (adminAddMachineBtn) {
      adminAddMachineBtn.addEventListener('click', function() {
          // Đảm bảo có module hiện tại
          if (!currentUserModule) {
              alert('Vui lòng chọn module trước!');
              return;
          }
          
          // Đồng bộ modules
          window.currentAdminModule = currentUserModule;
          
          // Gọi hàm từ admin.js
          if (typeof window.openAdminMachineForm === 'function') {
              window.openAdminMachineForm();
          }
      });
  }

  // Sự kiện đóng form máy
  const closeAdminMachineFormModal = document.getElementById('admin-close-machine-form-modal');
  if (closeAdminMachineFormModal) {
      closeAdminMachineFormModal.addEventListener('click', function() {
          const modal = document.getElementById('admin-machine-form-modal');
          if (modal) modal.style.display = 'none';
      });
  }

  const adminCancelMachineBtn = document.getElementById('admin-cancel-machine-btn');
  if (adminCancelMachineBtn) {
      adminCancelMachineBtn.addEventListener('click', function() {
          const modal = document.getElementById('admin-machine-form-modal');
          if (modal) modal.style.display = 'none';
      });
  }

  // Sự kiện lưu máy
  const adminSaveMachineBtn = document.getElementById('admin-save-machine-btn');
  if (adminSaveMachineBtn) {
      adminSaveMachineBtn.addEventListener('click', function() {
          if (typeof window.saveAdminMachine === 'function') {
              window.saveAdminMachine();
          }
      });
  }

  // Sự kiện submit form
  const adminMachineForm = document.getElementById('admin-machine-form');
  if (adminMachineForm) {
      adminMachineForm.addEventListener('submit', function(e) {
          e.preventDefault();
          if (typeof window.saveAdminMachine === 'function') {
              window.saveAdminMachine();
          }
      });
  }

  // Đóng modal confirm
  const closeConfirmBtns = document.querySelectorAll('.close-modal');
  closeConfirmBtns.forEach(btn => {
      btn.addEventListener('click', function() {
          const modal = document.getElementById('confirm-modal');
          if (modal) modal.style.display = 'none';
      });
  });

  // Đóng toast
  const toastClose = document.querySelector('.toast-close');
  if (toastClose) {
      toastClose.addEventListener('click', function() {
          const toast = document.getElementById('notification-toast');
          if (toast) toast.style.display = 'none';
      });
  }
}, 1000);



  
  // Tải danh sách hệ thống
  loadSystems();
});





//! =================================================================
//! QUẢN LÝ HỆ THỐNG & MODULE
//  Mô tả: Tải và hiển thị danh sách hệ thống và module người dùng có quyền truy cập
//! =================================================================

//TODO Tải danh sách hệ thống========================================================================
async function loadSystems() {
  const systemsList = document.getElementById('systems-list');
  if (!systemsList) {
    console.error('Element #systems-list not found');
    return;
  }
  
  // Show loading indicator
  systemsList.innerHTML = '<div style="text-align:center;padding:20px;">Đang tải danh sách hệ thống...</div>';
  
  try {
    // Lấy thông tin người dùng
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin';
    
    // Lấy danh sách tất cả các hệ thống
    const sysResponse = await fetch('/api/systems/list');
    if (!sysResponse.ok) {
      throw new Error('Không thể lấy danh sách hệ thống');
    }
    
    let rawSystems = await sysResponse.json();
    
    // Xóa hết nội dung trước khi hiển thị
    systemsList.innerHTML = '';
    
    // Loại bỏ trùng lặp triệt để
    console.log("Danh sách hệ thống gốc:", rawSystems.length, rawSystems);
    
    // Sử dụng Map để loại bỏ trùng lặp theo tên
    const systemMap = new Map();
    
    for (const system of rawSystems) {
      if (!system.name) continue; // Bỏ qua các hệ thống không có tên
      
      // Chỉ lưu hệ thống nếu chưa có trong map hoặc ID mới lớn hơn ID cũ
      if (!systemMap.has(system.name) || 
          parseInt(system.id) > parseInt(systemMap.get(system.name).id)) {
        systemMap.set(system.name, system);
      }
    }
    
    // Chuyển Map thành mảng
    const systems = Array.from(systemMap.values());
    
    console.log("Danh sách hệ thống sau khi lọc:", systems.length, systems);
    
    // Kiểm tra nếu không có hệ thống nào
    if (!systems || systems.length === 0) {
      systemsList.innerHTML = '<div style="text-align:center;padding:20px;">Không có hệ thống nào.</div>';
      return;
    }
    
    // Nếu là admin, hiển thị tất cả hệ thống với quyền truy cập
    if (isAdmin) {
      const displayedSystems = new Set();
      
      // THÊM: Áp dụng thứ tự từ localStorage admin
      const savedSystemOrder = JSON.parse(localStorage.getItem('systemOrder') || '[]');
      if (savedSystemOrder.length > 0) {
          systems.sort((a, b) => {
              const orderA = savedSystemOrder.find(item => item.id === a.id);
              const orderB = savedSystemOrder.find(item => item.id === b.id);
              
              if (orderA && orderB) {
                  return orderA.order - orderB.order;
              } else if (orderA) {
                  return -1;
              } else if (orderB) {
                  return 1;
              } else {
                  return parseInt(a.id) - parseInt(b.id);
              }
          });
      } else {
          // Sắp xếp mặc định
          systems.sort((a, b) => {
              const orderA = a.order || parseInt(a.id) || 0;
              const orderB = b.order || parseInt(b.id) || 0;
              return orderA - orderB;
          });
      }
      
      systems.forEach(system => {
          if (!displayedSystems.has(system.name)) {
              displayedSystems.add(system.name);
              createSystemCard(system, true);
          }
      });
      return;
  }
    
    // Với người dùng thường, cần kiểm tra quyền truy cập từ phòng ban
    if (user && user.department) {
      // Lấy tất cả quyền module của phòng ban người dùng
      try {
        // Lấy danh sách tất cả các module
        const modulesResponse = await fetch('/api/modules/list');
        if (!modulesResponse.ok) {
          throw new Error('Không thể lấy danh sách module');
        }
        const allModules = await modulesResponse.json();
        
        // Lấy quyền module của phòng ban
        const deptModulesResponse = await fetch(`/api/users/permissions/department/modules?department=${encodeURIComponent(user.department)}`);
        if (!deptModulesResponse.ok) {
          throw new Error('Không thể lấy quyền module của phòng ban');
        }
        const deptPermissions = await deptModulesResponse.json();
        const deptModulePermissions = deptPermissions.permissions || [];
        
        // Ánh xạ quyền truy cập theo hệ thống
        const userSystemAccess = {};
        
        // Một hệ thống được truy cập nếu ít nhất một module của nó được phép truy cập
        for (const permission of deptModulePermissions) {
          if (permission.can_access === 1) {
            // Tìm module được cấp quyền
            const module = allModules.find(m => m.id === permission.module_id);
            if (module && module.system_id) {
              // Đánh dấu hệ thống có thể truy cập
              userSystemAccess[module.system_id] = true;
            }
          }
        }
        
        // Lấy thêm quyền đặc biệt của người dùng
        const userPermissionsResponse = await fetch(`/api/users/permissions/user/modules?userId=${user.id}&nhaMay=${encodeURIComponent(user.nhaMay || '')}`);
        if (userPermissionsResponse.ok) {
          const userPermissions = await userPermissionsResponse.json();
          
          // Nếu người dùng có quyền đặc biệt cho module nào đó
          for (const permission of userPermissions) {
            if (permission.can_access === 1) {
              // Tìm module được cấp quyền
              const module = allModules.find(m => m.id === permission.module_id);
              if (module && module.system_id) {
                // Đánh dấu hệ thống có thể truy cập
                userSystemAccess[module.system_id] = true;
              }
            }
          }
        }
        
        // Theo dõi hệ thống đã hiển thị để tránh trùng lặp
        const displayedSystems = new Set();

// THÊM: Áp dụng thứ tự từ localStorage admin
const savedSystemOrder = JSON.parse(localStorage.getItem('systemOrder') || '[]');
if (savedSystemOrder.length > 0) {
    systems.sort((a, b) => {
        const orderA = savedSystemOrder.find(item => item.id === a.id);
        const orderB = savedSystemOrder.find(item => item.id === b.id);
        
        if (orderA && orderB) {
            return orderA.order - orderB.order;
        } else if (orderA) {
            return -1;
        } else if (orderB) {
            return 1;
        } else {
            return parseInt(a.id) - parseInt(b.id);
        }
    });
} else {
    // Sắp xếp mặc định
    systems.sort((a, b) => {
        const orderA = a.order || parseInt(a.id) || 0;
        const orderB = b.order || parseInt(b.id) || 0;
        return orderA - orderB;
    });
}

// Hiển thị các hệ thống
for (const system of systems) {
          // Kiểm tra nếu hệ thống đã hiển thị thì bỏ qua
          if (displayedSystems.has(system.name)) {
            console.log(`Bỏ qua hệ thống trùng lặp: ${system.name}`);
            continue;
          }
          
          // Một hệ thống được truy cập nếu ít nhất một module được phép
          const hasAccess = userSystemAccess[system.id] || false;
          
          // Đánh dấu đã hiển thị
          displayedSystems.add(system.name);
          
          // Tạo card cho hệ thống
          createSystemCard(system, hasAccess);
        }
        
      } catch (error) {
        console.error('Lỗi khi kiểm tra quyền phòng ban:', error);
        
        // Fallback: Hiển thị tất cả hệ thống nhưng không có quyền
        // Theo dõi hệ thống đã hiển thị để tránh trùng lặp
        const fallbackDisplayedSystems = new Set();

// THÊM: Áp dụng thứ tự trước khi hiển thị
const savedSystemOrderFallback = JSON.parse(localStorage.getItem('systemOrder') || '[]');
if (savedSystemOrderFallback.length > 0) {
    systems.sort((a, b) => {
        const orderA = savedSystemOrderFallback.find(item => item.id === a.id);
        const orderB = savedSystemOrderFallback.find(item => item.id === b.id);
        return (orderA?.order || 999) - (orderB?.order || 999);
    });
}

systems.forEach(system => {
    // Kiểm tra nếu hệ thống đã hiển thị thì bỏ qua
    if (fallbackDisplayedSystems.has(system.name)) {
        return;
    }
    
    // Đánh dấu đã hiển thị
    fallbackDisplayedSystems.add(system.name);
    
    createSystemCard(system, false);
});
      }
    } else {
      // Nếu không có phòng ban, hiển thị tất cả hệ thống nhưng không có quyền
      // Theo dõi hệ thống đã hiển thị để tránh trùng lặp
      const noDeptDisplayedSystems = new Set();

// THÊM: Áp dụng thứ tự trước khi hiển thị
const savedSystemOrderNoDept = JSON.parse(localStorage.getItem('systemOrder') || '[]');
if (savedSystemOrderNoDept.length > 0) {
    systems.sort((a, b) => {
        const orderA = savedSystemOrderNoDept.find(item => item.id === a.id);
        const orderB = savedSystemOrderNoDept.find(item => item.id === b.id);
        return (orderA?.order || 999) - (orderB?.order || 999);
    });
}

systems.forEach(system => {
    // Kiểm tra nếu hệ thống đã hiển thị thì bỏ qua
    if (noDeptDisplayedSystems.has(system.name)) {
        return;
    }
    
    // Đánh dấu đã hiển thị
    noDeptDisplayedSystems.add(system.name);
    
    createSystemCard(system, false);
});
    }
    
  } catch (error) {
    console.error('Lỗi khi tải danh sách hệ thống:', error);
    systemsList.innerHTML = `<div style="text-align:center;color:red;padding:20px;">Lỗi: ${error.message}</div>`;
  }
}

//TODO Tạo card cho hệ thống========================================================================
function createSystemCard(system, hasAccess) {
  const systemsList = document.getElementById('systems-list');
  if (!systemsList) return; 
  
  // Kiểm tra xem hệ thống đã tồn tại chưa (thêm dòng này)
  const existingCard = Array.from(systemsList.children).find(card => 
    card.querySelector('.system-name') && 
    card.querySelector('.system-name').textContent === (system.name || 'Không tên')
  );
  
  if (existingCard) {
    console.log(`Đã có hệ thống ${system.name}, không tạo thêm card`);
    return;
  }
  
  const card = document.createElement('div');
  card.className = 'system-card';
  
  // Apply styling based on access
  if (!hasAccess) {
    card.style.opacity = '0.3';
    card.style.cursor = 'not-allowed';
  } else {
    card.style.cursor = 'pointer';
  }
  
  card.innerHTML = `
    <div class="system-icon">
  ${system.icon ? (system.icon.startsWith('http') ? 
    `<img src="${system.icon}" alt="Icon" style="width: 100px; height: 100px;">` : 
    `<i class="${system.icon}"></i>`) : 
    '<i class="fas fa-cog"></i>'}
</div>
    <div class="system-name">${system.name || 'Không tên'}</div>
    <div class="system-description">${system.description || ''}</div>
  `;
  
  if (hasAccess) {
    card.addEventListener('click', function() {
      loadModules(system.id, system.name);
    });
  } else {
    card.addEventListener('click', function() {
      showNoAccessMessage(system.name);
    });
  }
  
  systemsList.appendChild(card);

  // Căn giữa systems container nếu có ít card - dùng setTimeout để đảm bảo tất cả cards đã được thêm
  setTimeout(() => {
      if (systemsList) {
          const cardCount = systemsList.children.length;
          if (cardCount <= 3) {
              systemsList.style.justifyContent = 'center';
          } else {
              systemsList.style.justifyContent = 'stretch';
          }
      }
  }, 100);


}

//TODO Tải danh sách module của hệ thống========================================================================
async function loadModules(systemId, systemName) {
  // Get references to the views
  const systemsView = document.getElementById('systems-view');
  const modulesView = document.getElementById('modules-view');
  const modulesList = document.getElementById('modules-list');
  const currentSystemName = document.getElementById('current-system-name');
  
  if (!modulesList) {
    console.error('Element #modules-list not found');
    return;
  }
  
  // Show loading indicator
  modulesList.innerHTML = '<div style="text-align:center;padding:20px;">Đang tải danh sách module...</div>';
  
  // Update system name
  if (currentSystemName) {
    currentSystemName.textContent = systemName || '';
  }
  
  // Switch to modules view
  if (systemsView) {
    systemsView.style.display = 'none';
}
if (modulesView) {
    modulesView.style.display = 'block';
}


  try {
    // Lấy thông tin người dùng
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin';
    
    // Lấy danh sách module của hệ thống
    const response = await fetch(`/api/modules/list?system_id=${systemId}`);
    if (!response.ok) {
      throw new Error('Không thể lấy danh sách module');
    }
    
    const modules = await response.json();
    
    // Clear modules list
    modulesList.innerHTML = '';
    
    if (!modules || modules.length === 0) {
      modulesList.innerHTML = '<div style="text-align:center;padding:20px;">Chưa có module nào trong hệ thống này.</div>';
      return;
    }
    
    // Nếu là admin, tất cả các module đều có quyền truy cập
    if (isAdmin) {
      // THÊM: Sắp xếp modules trước khi hiển thị
      // Áp dụng thứ tự từ localStorage admin nếu có
const savedModuleOrders = JSON.parse(localStorage.getItem('moduleOrders') || '{}');
if (savedModuleOrders[systemId]) {
    const moduleOrder = savedModuleOrders[systemId];
    modules.sort((a, b) => {
        const orderA = moduleOrder.find(item => item.id === a.id);
        const orderB = moduleOrder.find(item => item.id === b.id);
        
        if (orderA && orderB) {
            return orderA.order - orderB.order;
        } else if (orderA) {
            return -1;
        } else if (orderB) {
            return 1;
        } else {
            return parseInt(a.id) - parseInt(b.id);
        }
    });
} else {
    modules.sort((a, b) => {
        const orderA = a.order || parseInt(a.id) || 0;
        const orderB = b.order || parseInt(b.id) || 0;
        return orderA - orderB;
    });
}


      
      modules.forEach(module => {
          createModuleCard(module, true);
      });
      return;
  }
    
    // Với người dùng thường, kiểm tra quyền truy cập cho từng module
    const userModuleAccess = {};
    
    // Kiểm tra quyền từ phòng ban trước
    if (user && user.department) {
      // Lấy quyền module của phòng ban
      const deptModulesResponse = await fetch(`/api/users/permissions/department/modules?department=${encodeURIComponent(user.department)}`);
      if (deptModulesResponse.ok) {
        const deptPermissions = await deptModulesResponse.json();
        const deptModulePermissions = deptPermissions.permissions || [];
        
        // Ghi nhận quyền truy cập module từ phòng ban
        deptModulePermissions.forEach(permission => {
          if (permission.can_access === 1) {
            userModuleAccess[permission.module_id] = true;
          }
        });
      }
    }
    
    // Kiểm tra quyền đặc biệt của người dùng (ưu tiên cao hơn quyền phòng ban)
    if (user && user.id && user.nhaMay) {
      const userPermissionsResponse = await fetch(`/api/users/permissions/user/modules?userId=${user.id}&nhaMay=${encodeURIComponent(user.nhaMay || '')}`);
      if (userPermissionsResponse.ok) {
        const userPermissions = await userPermissionsResponse.json();
        
        // Ghi nhận quyền truy cập module từ quyền đặc biệt của người dùng
        userPermissions.forEach(permission => {
          // Quyền người dùng ghi đè quyền phòng ban
          userModuleAccess[permission.module_id] = permission.can_access === 1;
        });
      }
    }
    
    // Áp dụng thứ tự từ localStorage admin nếu có
const savedModuleOrdersUser = JSON.parse(localStorage.getItem('moduleOrders') || '{}');
if (savedModuleOrdersUser[systemId]) {
    const moduleOrder = savedModuleOrdersUser[systemId];
    modules.sort((a, b) => {
        const orderA = moduleOrder.find(item => item.id === a.id);
        const orderB = moduleOrder.find(item => item.id === b.id);
        
        if (orderA && orderB) {
            return orderA.order - orderB.order;
        } else if (orderA) {
            return -1;
        } else if (orderB) {
            return 1;
        } else {
            return parseInt(a.id) - parseInt(b.id);
        }
    });
} else {
    modules.sort((a, b) => {
        const orderA = a.order || parseInt(a.id) || 0;
        const orderB = b.order || parseInt(b.id) || 0;
        return orderA - orderB;
    });
}

  
  modules.forEach(module => {
      // Kiểm tra quyền truy cập cho module này
      const hasAccess = userModuleAccess[module.id] || false;
      createModuleCard(module, hasAccess);
  });
    
  } catch (error) {
    console.error('Lỗi khi tải danh sách module:', error);
    modulesList.innerHTML = `<div style="text-align:center;color:red;padding:20px;">Lỗi: ${error.message}</div>`;
  }
}

//TODO Tạo card cho module========================================================================
function createModuleCard(module, hasAccess) {
  const modulesList = document.getElementById('modules-list');
  if (!modulesList) return;
  
  const card = document.createElement('div');
  card.className = 'module-card';
  
  // Apply styling based on access
  if (!hasAccess) {
    card.style.opacity = '0.3'; // Giảm opacity nhưng vẫn hiển thị rõ ràng
    card.style.cursor = 'not-allowed';
  } else {
    card.style.cursor = 'pointer';
  }
  
  card.innerHTML = `
  <div class="module-icon">
      ${module.icon ? (module.icon.startsWith('http') ? 
          `<img src="${module.icon}" alt="Icon" style="width: 100px; height: 100px;">` : 
          `<i class="${module.icon}"></i>`) : 
          '<i class="fas fa-cube"></i>'}
  </div>
  <div class="module-name">${module.name || 'Module không tên'}</div>
  <div class="module-description" style="font-size: 12px; color: #666; margin-top: 5px;">${module.description || ''}</div>
  ${!hasAccess ? '<div style="color: #e74c3c; margin-top: 5px; font-size: 12px;"><i class="fas fa-lock"></i> Không có quyền</div>' : ''}
  ${hasAccess && getCurrentUser()?.role === 'admin' && module.id === 'innm1' ? `
  <div style="margin-top: 10px; display: flex; gap: 5px; justify-content: center;">
      <button class="btn-manage-production-users" onclick="openProductionUserManagementModal('${module.id}'); event.stopPropagation();" 
              style="padding: 4px 8px; font-size: 11px; background: #28a745; color: white; border: none; border-radius: 3px;">
          <i class="fas fa-users"></i> Quản lý người dùng
      </button>
  </div>
  ` : ''}
`;
  
  card.addEventListener('click', function() {
    if (hasAccess) {
        if (module.path) {
            // Kiểm tra nếu cần chọn máy (hệ thống sản xuất)
            if (isProductionSystem(module.system_id)) {
                openUserMachineSelectionModal(module);
            } else {
                window.location.href = module.path;
            }
        } else {
            alert(`Module "${module.name}" không có đường dẫn!`);
        }
    } else {
        alert(`Bạn không có quyền truy cập...`);
    }
});
  
  modulesList.appendChild(card);
}

//TODO Hiển thị thông báo không có quyền truy cập hệ thống========================================================================
function showNoAccessMessage(systemName) {
  const systemsView = document.getElementById('systems-view');
  const modulesView = document.getElementById('modules-view');
  const modulesList = document.getElementById('modules-list');
  const currentSystemName = document.getElementById('current-system-name');
  
  // Update system name
  if (currentSystemName) {
    currentSystemName.textContent = systemName || '';
  }
  
  // Display no access message
  if (modulesList) {
    modulesList.innerHTML = `
      <div class="no-access">
        <i class="fas fa-lock"></i>
        <h2>Không có quyền truy cập</h2>
        <p>Bạn không có quyền truy cập vào hệ thống ${systemName}.</p>
        <p>Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
      </div>
    `;
  }
  
  // Switch to modules view
  if (systemsView) systemsView.style.display = 'none';
  if (modulesView) modulesView.style.display = 'block';
}



















//! =================================================================
//! MACHINE SELECTION FOR MODULES
//  Mô tả: Chọn máy khi truy cập module sản xuất
//! =================================================================

// Biến lưu trữ thông tin module hiện tại
let currentUserModule = null;
// let currentAdminModule = null;

//TODO Kiểm tra hệ thống sản xuất========================================================================
function isProductionSystem(systemId) {
    const productionSystems = ['sanxuat-nm1', 'sanxuat-nm2', 'sanxuat-nm3'];
    return productionSystems.includes(systemId);
}

//TODO Mở modal chọn máy cho user========================================================================
async function openUserMachineSelectionModal(module) {
  try {
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin';
    
    // Lưu thông tin module hiện tại
    currentUserModule = module;
    
    // Đồng bộ với admin module thông qua window object
    if (isAdmin && typeof window !== 'undefined') {
        window.currentAdminModule = module;
    }
    
    // Cập nhật thông tin module trong modal
    const userIconElement = document.getElementById('user-selected-module-icon');
    if (module.icon && module.icon.startsWith('http')) {
        userIconElement.innerHTML = `<img src="${module.icon}" alt="Icon" style="width: 48px; height: 48px;">`;
    } else {
        userIconElement.className = module.icon || 'fas fa-cube';
        userIconElement.innerHTML = '';
    }
    document.getElementById('user-selected-module-name').textContent = module.name || 'Module không tên';
    document.getElementById('user-selected-module-description').textContent = module.description || '';
    
    // Hiển thị nút quản lý máy chỉ cho admin
    const managementSection = document.getElementById('user-machine-management');
    if (managementSection) {
        managementSection.style.display = isAdmin ? 'block' : 'none';
    }
    
    // Reset tìm kiếm
    const searchInput = document.getElementById('user-machine-search');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Hiển thị modal
    document.getElementById('user-machine-modal').style.display = 'block';
    
    // Tải danh sách máy theo system_id
    await loadUserMachines();
    
} catch (error) {
    console.error('Lỗi khi mở modal chọn máy:', error);
    alert('Có lỗi khi tải danh sách máy!');
}
}

//TODO Tải danh sách máy cho user========================================================================
async function loadUserMachines(searchTerm = '') {
    try {
        const machinesGrid = document.getElementById('user-machines-grid');
        const emptyState = document.getElementById('user-empty-machines');
        
        if (!machinesGrid || !emptyState) {
            console.error('Không tìm thấy elements modal máy');
            return;
        }   
        
        // Hiển thị loading
        machinesGrid.innerHTML = `
            <div class="user-machines-loading" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 40px; color: #7f8c8d;">
                <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #e0e6ed; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <p>Đang tải danh sách máy...</p>
            </div>
        `;
        emptyState.style.display = 'none';
        
        // Gọi API lấy danh sách máy hoạt động
        const moduleId = currentUserModule ? currentUserModule.id : '';
        const url = moduleId ? `/api/machines/active/list?module_id=${moduleId}` : '/api/machines/active/list';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Không thể lấy danh sách máy');
        }
        
        let machines = await response.json();
        
        // Lọc theo tìm kiếm nếu có
        if (searchTerm) {
          machines = machines.filter(machine => 
            (machine.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (machine.location || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        }
        
        // Hiển thị danh sách máy
        displayUserMachines(machines);
        
    } catch (error) {
        console.error('Lỗi khi tải danh sách máy:', error);
        
        // Hiển thị lỗi
        const machinesGrid = document.getElementById('user-machines-grid');
        if (machinesGrid) {
            machinesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <h3>Không thể tải danh sách máy</h3>
                    <p>${error.message}</p>
                    <button class="btn-primary" onclick="loadUserMachines()" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
        }
    }
}

//TODO Hiển thị danh sách máy cho user========================================================================
function displayUserMachines(machines) {
    const machinesGrid = document.getElementById('user-machines-grid');
    const emptyState = document.getElementById('user-empty-machines');
    
    if (!machinesGrid || !emptyState) return;
    
    if (!machines || machines.length === 0) {
        machinesGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    machinesGrid.innerHTML = '';
    
    // Sắp xếp máy theo thứ tự tăng dần (tên máy)
machines.sort((a, b) => {
  const nameA = (a.name || '').toLowerCase();
  const nameB = (b.name || '').toLowerCase();
  return nameA.localeCompare(nameB);
});

machines.forEach(machine => {
        const card = document.createElement('div');
        card.className = 'user-machine-card';
        
        card.innerHTML = `
            <div class="machine-header">
    <div>
        <h3 class="machine-name">${machine.name || 'Không tên'}</h3>
        <div class="machine-location">${machine.location || ''}</div>
    </div>
                <span class="machine-status ${machine.status || 'active'}">${machine.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</span>
            </div>
            <div class="machine-description">${machine.description || 'Không có mô tả'}</div>
        `;
        
        // Thêm sự kiện click để chọn máy
        card.addEventListener('click', function() {
            selectUserMachine(machine);
        });
        
        machinesGrid.appendChild(card);
    });
}




function showMachineSelectionLoading(machineName, moduleName) {
  // Tạo overlay loading
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'machine-selection-loading';
  loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
  `;

  const spinner = document.createElement('div');
  spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
  `;

  const loadingText = document.createElement('div');
  loadingText.style.cssText = `
      color: white;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
  `;
  loadingText.textContent = `Đang chuyển đến máy "${machineName}"`;

  const progressText = document.createElement('div');
  progressText.style.cssText = `
      color: #ccc;
      font-size: 14px;
      text-align: center;
  `;
  progressText.textContent = `Module: ${moduleName}`;

  // Thêm CSS animation nếu chưa có
  if (!document.getElementById('machineLoadingStyle')) {
      const style = document.createElement('style');
      style.id = 'machineLoadingStyle';
      style.textContent = `
          @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
          }
      `;
      document.head.appendChild(style);
  }

  loadingOverlay.appendChild(spinner);
  loadingOverlay.appendChild(loadingText);
  loadingOverlay.appendChild(progressText);
  document.body.appendChild(loadingOverlay);
}




//TODO Chọn máy và vào module========================================================================
function selectUserMachine(machine) {
  if (!currentUserModule) {
    alert('Có lỗi xảy ra, vui lòng thử lại!');
    return;
}

// Đồng bộ modules thông qua window object
if (typeof window !== 'undefined') {
    window.currentAdminModule = currentUserModule;
}

// Lưu máy đã chọn vào localStorage
localStorage.setItem('selectedMachine', JSON.stringify(machine));

// Đóng modal
document.getElementById('user-machine-modal').style.display = 'none';

// Hiển thị loading
showMachineSelectionLoading(machine.name, currentUserModule.name);

// Mở module với thông tin máy sau 1.5 giây
setTimeout(() => {
    const moduleUrl = `${currentUserModule.path}?machine=${encodeURIComponent(machine.id)}&machineName=${encodeURIComponent(machine.name)}`;
    window.location.href = moduleUrl;
}, 1500);
}







// // Hàm helper để lấy tên hệ thống
function getSystemName(systemId) {
  const systemNames = {
      'sanxuat-nm1': 'Sản xuất NM1',
      'sanxuat-nm2': 'Sản xuất NM2', 
      'sanxuat-nm3': 'Sản xuất NM3'
  };
  return systemNames[systemId] || 'Hệ thống không xác định';
}

// Hàm global để có thể gọi từ onclick
window.editAdminMachine = function(machineId) {
  openAdminMachineForm(machineId);
};

window.deleteAdminMachine = function(machineId) {
  handleDeleteAdminMachine(machineId);
};



// Hàm đồng bộ currentAdminModule với currentUserModule
function syncCurrentModules() {
  if (currentUserModule && !currentAdminModule) {
      currentAdminModule = currentUserModule;
  }
}










//! =================================================================
//! PRODUCTION USERS MANAGEMENT
//  Mô tả: Quản lý người dùng cho báo cáo sản xuất
//! =================================================================

// Biến lưu trữ module hiện tại cho production users
// let currentProductionModule = null;

//TODO Mở modal quản lý người dùng sản xuất========================================================================
async function openProductionUserManagementModal(moduleId) {
    try {
        currentProductionModule = moduleId;
        
        // Hiển thị modal
        const modal = document.getElementById('production-user-modal');
        if (!modal) {
            console.error('Không tìm thấy modal quản lý người dùng sản xuất');
            return;
        }
        
        modal.style.display = 'block';
        
        // Tải danh sách người dùng cho từng chức vụ
        await loadProductionUsersByPosition();
        
        // Thiết lập sự kiện tìm kiếm
        setupProductionUserSearchEvents();
        
    } catch (error) {
        console.error('Lỗi khi mở modal quản lý người dùng sản xuất:', error);
        // showToast('Có lỗi khi tải giao diện quản lý người dùng!', 'error');
    }
}

//TODO Tải danh sách người dùng theo chức vụ========================================================================
async function loadProductionUsersByPosition() {
    const positions = ['quan-doc', 'phu-may-1', 'phu-may-2'];
    
    for (const position of positions) {
        try {
            const response = await fetch(`/api/production-users/by-position/${currentProductionModule}/${position}`);
            if (!response.ok) {
                throw new Error('Không thể lấy danh sách người dùng');
            }
            
            const users = await response.json();
            displayProductionUsers(position, users);
        } catch (error) {
            console.error(`Lỗi khi tải người dùng cho chức vụ ${position}:`, error);
        }
    }
}

//TODO Hiển thị danh sách người dùng theo chức vụ========================================================================
function displayProductionUsers(position, users) {
    const container = document.querySelector(`.${position}-users`);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (users.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #666; padding: 20px; font-style: italic;">
                Chưa có người dùng nào
            </div>
        `;
        return;
    }
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'production-user-item';
        userElement.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 8px 12px; 
            background: #f8f9fa; 
            border-radius: 4px; 
            margin-bottom: 8px;
        `;
        
        userElement.innerHTML = `
            <div>
                <div style="font-weight: 600; color: #2c3e50;">${user.user_fullname || 'N/A'}</div>
                <div style="font-size: 12px; color: #6c757d;">${user.user_employee_id || 'N/A'} - ${user.factory}</div>
            </div>
            <button onclick="removeProductionUser('${user.id}')" 
                    style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(userElement);
    });
}

//TODO Thiết lập sự kiện tìm kiếm========================================================================
function setupProductionUserSearchEvents() {
    const searchInputs = document.querySelectorAll('.position-search');
    
    searchInputs.forEach(input => {
        // Xóa event listeners cũ
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Thêm event listener mới
        newInput.addEventListener('input', async function() {
            const query = this.value.trim();
            const position = this.getAttribute('data-position');
            
            if (query.length < 2) {
                hideSearchResults(position);
                return;
            }
            
            try {
                const response = await fetch(`/api/production-users/search-users?q=${encodeURIComponent(query)}&module_id=${currentProductionModule}`);
                if (!response.ok) throw new Error('Lỗi tìm kiếm');
                
                const users = await response.json();
                displaySearchResults(position, users);
            } catch (error) {
                console.error('Lỗi khi tìm kiếm người dùng:', error);
            }
        });
        
        // Ẩn kết quả khi click ra ngoài
        newInput.addEventListener('blur', function() {
            setTimeout(() => {
                const position = this.getAttribute('data-position');
                hideSearchResults(position);
            }, 200);
        });
    });
}

//TODO Hiển thị kết quả tìm kiếm========================================================================
function displaySearchResults(position, users) {
    const resultsContainer = document.querySelector(`.${position}-results`);
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    if (users.length === 0) {
        resultsContainer.innerHTML = `
            <div style="padding: 8px; color: #666; text-align: center;">
                Không tìm thấy người dùng phù hợp
            </div>
        `;
    } else {
        users.forEach(user => {
            const resultItem = document.createElement('div');
            resultItem.style.cssText = `
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 8px 12px; 
                border-bottom: 1px solid #eee; 
                cursor: pointer;
            `;
            
            resultItem.innerHTML = `
                <div>
                    <div style="font-weight: 600;">${user.fullname}</div>
                    <div style="font-size: 12px; color: #666;">${user.employee_id} - ${user.factory}</div>
                </div>
                <button onclick="addProductionUser('${user.id}', '${position}', '${user.factory}'); event.stopPropagation();" 
                        style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; font-size: 12px;">
                    ADD
                </button>
            `;
            
            resultsContainer.appendChild(resultItem);
        });
    }
    
    resultsContainer.style.display = 'block';
}

//TODO Ẩn kết quả tìm kiếm========================================================================
function hideSearchResults(position) {
    const resultsContainer = document.querySelector(`.${position}-results`);
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

//TODO Thêm người dùng vào chức vụ========================================================================
async function addProductionUser(userId, position, factory) {
    try {
        const response = await fetch('/api/production-users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                module_id: currentProductionModule,
                position: position,
                factory: factory
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi thêm người dùng');
        }
        
        // Tải lại danh sách
        await loadProductionUsersByPosition();
        
        // Xóa ô tìm kiếm và ẩn kết quả
        const searchInput = document.querySelector(`[data-position="${position}"]`);
        if (searchInput) {
            searchInput.value = '';
        }
        hideSearchResults(position);
        
        // showToast('Đã thêm người dùng thành công!');
    } catch (error) {
        console.error('Lỗi khi thêm người dùng:', error);
        // showToast(error.message, 'error');
    }
}

//TODO Xóa người dùng khỏi chức vụ========================================================================
async function removeProductionUser(productionUserId) {
    try {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này khỏi chức vụ?')) {
            return;
        }
        
        const response = await fetch(`/api/production-users/${productionUserId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi xóa người dùng');
        }
        
        // Tải lại danh sách
        await loadProductionUsersByPosition();
        
        // showToast('Đã xóa người dùng thành công!');
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        // showToast(error.message, 'error');
    }
}

// Hàm global để có thể gọi từ onclick
window.openProductionUserManagementModal = openProductionUserManagementModal;
window.addProductionUser = addProductionUser;
window.removeProductionUser = removeProductionUser;


