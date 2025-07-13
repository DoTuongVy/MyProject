document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập và phân quyền
    checkAuthentication();
});


//! =================================================================
//! KIỂM TRA ĐĂNG NHẬP & PHÂN QUYỀN
//  Mô tả: Kiểm tra trạng thái đăng nhập và quyền truy cập
//! =================================================================

//TODO Kiểm tra đăng nhập và phân quyền========================================================================
async function checkAuthentication() {
    const currentUser = getCurrentUser();
    const userPermissions = getUserPermissions();
    
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!currentUser) {
        window.location.href = '/login/login.html';
        return;
    }
    
    // Tạo header riêng cho thông tin người dùng và đăng xuất
    createUserHeader(currentUser);
    // Đảm bảo header luôn hiển thị
// ensureHeaderAlwaysVisible();

// let lastScrollTop = 0;
//         window.addEventListener('scroll', function() {
//             // Sử dụng window.pageYOffset cho tương thích trình duyệt tốt hơn
//             let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

//             // Nếu cuộn lên (scroll up)
//             if (scrollTop < lastScrollTop) {
//                 header.style.top = '0';
//             } 
//             // Nếu cuộn xuống (scroll down)
//             else {
//                 // Chỉ ẩn khi đã cuộn qua chiều cao của header
//                 if (scrollTop > header.offsetHeight) {
//                     header.style.top = `-${header.offsetHeight}px`;
//                 }
//             }
//             // Cập nhật vị trí scroll cuối, xử lý trường hợp cuộn lên trên cùng
//             lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
//         }, false);

        
    
    // Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;
    
    // Nếu đang ở trang admin và không phải admin thì chuyển hướng
if (currentPath.includes('/admin') && currentUser.role !== 'admin') {
    window.location.href = '/user';
    return;
}

// THÊM: Cho phép admin truy cập /user mà không bị chuyển hướng
if (currentPath.includes('/user') && currentUser.role === 'admin') {
    // Admin được phép truy cập /user, không cần chuyển hướng
    createUserHeader(currentUser);
    return;
}

// Nếu đang ở các trang module (QLVT,...), kiểm tra quyền
if (currentPath.includes('/QLVT/') && currentUser.role !== 'admin') {
        // Lấy module hiện tại
        const moduleName = currentPath.includes('phieusangcuon.html') ? 'phieusangcuon' : 
                          currentPath.includes('phieucat.html') ? 'phieucat' : '';
        
        if (moduleName) {
            try {
                // Kiểm tra quyền truy cập module cho người dùng
                const response = await fetch(`/api/users/permissions/user/modules?userId=${currentUser.id}&moduleId=${moduleName}&nhaMay=${encodeURIComponent(currentUser.nhaMay)}`);
                const permissions = await response.json();
                
                let hasAccess = permissions.some(p => p.can_access === 1);
                
                // Nếu người dùng không có quyền đặc biệt, kiểm tra quyền theo phòng ban
                if (!hasAccess && currentUser.department) {
                    const deptResponse = await fetch(`/api/users/permissions/department/modules?department=${encodeURIComponent(currentUser.department)}&moduleId=${moduleName}`);
                    const deptData = await deptResponse.json();
                    
                    // Kiểm tra quyền của phòng ban
                    if (deptData && deptData.permissions && deptData.permissions.length > 0) {
                        hasAccess = deptData.permissions.some(p => p.can_access === 1);
                    } else if (deptData && deptData.can_access === 1) {
                        hasAccess = true;
                    }
                }
                
                if (!hasAccess) {
                    showAccessDenied();
                    return;
                }
                
                // Lấy quyền chỉnh sửa và xóa từ người dùng
                // Nếu không có quyền đặc biệt từ người dùng, mặc định là không có quyền chỉnh sửa/xóa
                const canEdit = permissions.some(p => p.can_edit === 1);
                const canDelete = permissions.some(p => p.can_delete === 1);
                
                // Áp dụng quyền vào giao diện
                applyModulePermissions(moduleName, canEdit, canDelete);
            } catch (error) {
                console.error('Lỗi khi kiểm tra quyền module:', error);
                showAccessDenied();
            }
        }
    }
}

//TODO Hiển thị thông báo không có quyền truy cập========================================================================
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

//TODO Tạo header hiển thị thông tin người dùng========================================================================
function createUserHeader(user) {
    // Kiểm tra xem header đã tồn tại chưa
    if (document.getElementById('user-auth-header')) {
        return;
    }
    
    // Tạo header mới
    const authHeader = document.createElement('div');
    authHeader.id = 'user-auth-header';
    authHeader.style.display = 'flex';
    if (user.role === 'admin') {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin/admin.html') || currentPath.includes('/admin/')) {
            authHeader.style.justifyContent = 'flex-end';
        } else {
            authHeader.style.justifyContent = 'space-between';
        }
    } else {
        authHeader.style.justifyContent = 'space-between';
    }
    authHeader.style.alignItems = 'center';
    authHeader.style.backgroundColor = '#f8f9fa';
    authHeader.style.padding = '15px 15px';
    authHeader.style.top = '0';
    authHeader.style.zIndex='1000';
    authHeader.style.position = 'sticky';
    authHeader.style.borderBottom = '1px solid #e3e3e3';
    
    // Thêm thông tin người dùng
    if (user.role === 'admin') {
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.includes('/admin/');
        
        authHeader.innerHTML = `
${currentPath.includes('/admin/') ? '' : '<img class="imglogo " style="float:left" src="../logo.gif" width="15%" alt="" >'}
  <div style="display: flex; align-items: center; gap: 20px;">
              <span class="admin-badge" style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                  <i class="fas fa-crown"></i> ADMIN
              </span>
              <span>
                <span style="font-weight: bold; color: #2c3e50;">${user.username}</span>
                <span> - </span>
                <span style="font-weight: bold; color: #2c3e50;">${user.fullname || user.username}</span>
              </span>
              <button id="toggle-interface-btn" style="padding: 6px 12px; background-color:rgb(0, 94, 255); color: white; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">
                  <i class="fas fa-${isAdminPage ? 'user' : 'cogs'}"></i> 
                  ${isAdminPage ? 'Chuyển sang giao diện người dùng' : 'Quay lại trang quản trị'}
              </button>

              <a href="/user" style="text-decoration: none; padding: 6px 12px; background-color: #28a745; color: white; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">
    <i class="fas fa-home"></i> Trang chủ
</a>
              
              <button id="logout-btn" style="padding: 6px 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; font-size: 13px; color: #495057; transition: all 0.3s ease;">
                  <i class="fas fa-sign-out-alt"></i> Đăng xuất\
              </button>
          </div>
        `;
    } else {
        // Hiển thị thanh người dùng thường
        authHeader.innerHTML = `
          <img class="imglogo " style="float:left" src="../logo.gif" width="15%" alt="" >
          <div style="display: flex; align-items: center; gap: 20px;">
              <span>
                <span style="font-weight: bold; color: #2c3e50;">${user.username}</span>
                <span> - </span>
                <span style="font-weight: bold; color: #2c3e50;">${user.fullname || user.username}</span>
              </span>
              <span style="color: #ffffff; font-size: 0.9em; padding: 5px 10px; background-color: #00478f; border-radius: 3px;">
                ${user.department || ''}
              </span>
              <a href="/user" style="text-decoration: none; padding: 6px 12px; background-color: #28a745; color: white; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">
                  <i class="fas fa-home"></i> Trang chủ
              </a>
              <button id="logout-btn" style="padding: 6px 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; font-size: 13px; color: #495057; transition: all 0.3s ease;">
                  <i class="fas fa-sign-out-alt"></i> Đăng xuất
              </button>
          </div>
        `;
    }
    
    // Chèn header vào đầu trang
    const body = document.querySelector('body');
    if (body) {
        body.parentNode.insertBefore(authHeader, body);
    } else {
        document.body.insertBefore(authHeader, document.body.firstChild);
    }
    
    // Thêm CSS để căn chỉnh với header hiện tại
    const style = document.createElement('style');
    style.textContent = `
        #user-auth-header {
            margin-bottom: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        #user-auth-header a {
            text-decoration: none !important;
            transition: all 0.3s ease;
        }
        
        #user-auth-header a:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        #user-auth-header button:hover {
            background-color: #e0e0e0 !important;
        }
        
        .admin-badge {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }
        
        @media (max-width: 768px) {
            #user-auth-header {
                flex-direction: column;
                align-items: flex-end;
                padding: 10px;
            }
            
            #user-auth-header > div {
                flex-wrap: wrap;
                justify-content: center;
                gap: 8px;
            }
            
            #user-auth-header a,
            #user-auth-header button {
                font-size: 12px !important;
                padding: 4px 8px !important;
            }
        }
    `;
    document.head.appendChild(style);


    // Thêm sự kiện toggle interface cho admin
if (user.role === 'admin') {
    const toggleBtn = document.getElementById('toggle-interface-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/admin/')) {
                window.location.href = '/user/';
            } else {
                window.location.href = '/admin/admin.html';
            }
        });
    }
}
    
    // Thêm sự kiện đăng xuất
    document.getElementById('logout-btn').addEventListener('click', logout);
}



//TODO Lấy thông tin người dùng hiện tại từ session storage========================================================================
function getCurrentUser() {
    const userString = sessionStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
}

//TODO Lấy quyền truy cập từ session storage========================================================================
function getUserPermissions() {
    const permissionsString = sessionStorage.getItem('userPermissions');
    return permissionsString ? JSON.parse(permissionsString) : null;
}



//! =================================================================
//! PHÂN QUYỀN UI
//  Mô tả: Áp dụng phân quyền lên giao diện người dùng
//! =================================================================

//TODO Áp dụng quyền vào giao diện người dùng========================================================================
function applyPermissionsUI(permissions) {
    // Kiểm tra quyền truy cập Phiếu Sang Cuộn
    const hasSangCuonAccess = permissions['phieu-sang-cuon']?.canAccess;
    // Kiểm tra quyền truy cập Phiếu Cắt
    const hasCatAccess = permissions['phieu-cat']?.canAccess;
    
    // Nếu không có quyền truy cập cả hai loại phiếu
    if (!hasSangCuonAccess && !hasCatAccess) {
        showAccessDenied();
        return;
    }
    
    // Tìm các tab phiếu
    const allTabs = document.querySelectorAll('.btn-primary, .btn-default');
    let sangCuonTab = null;
    let catTab = null;
    
    allTabs.forEach(tab => {
        const text = tab.textContent.trim().toLowerCase();
        if (text.includes('sang cuộn') || text.includes('sang cuon')) {
            sangCuonTab = tab;
        } else if (text.includes('cắt') || text.includes('cat')) {
            catTab = tab;
        }
    });
    
    // Xử lý quyền truy cập Phiếu Sang Cuộn
    if (!hasSangCuonAccess) {
        // Ẩn tab Phiếu Sang Cuộn nếu tìm thấy
        if (sangCuonTab) {
            sangCuonTab.style.display = 'none';
        }
        
        // Ẩn nội dung Phiếu Sang Cuộn
        const sangCuonContent = document.querySelector('#sang-cuon');
        if (sangCuonContent) {
            sangCuonContent.style.display = 'none';
        }
        
        // Nếu có quyền truy cập phiếu cắt, kích hoạt tab đó
        if (hasCatAccess && catTab) {
            catTab.click();
        }
    }
    
    // Xử lý quyền truy cập Phiếu Cắt
    if (!hasCatAccess) {
        // Ẩn tab Phiếu Cắt nếu tìm thấy
        if (catTab) {
            catTab.style.display = 'none';
        }
        
        // Ẩn nội dung Phiếu Cắt
        const catContent = document.querySelector('#cat');
        if (catContent) {
            catContent.style.display = 'none';
        }
    }
    
    // Xử lý quyền chỉnh sửa và xóa
    applyEditDeletePermissions(permissions);
}


//TODO Áp dụng quyền module========================================================================
function applyModulePermissions(moduleName, canEdit, canDelete) {
    if (moduleName === 'phieusangcuon') {
        // Áp dụng quyền cho phiếu sang cuộn
        if (!canEdit) {
            // Ẩn các nút thêm và sửa
            document.querySelectorAll('.btn-primary, .btn-edit').forEach(btn => {
                btn.style.display = 'none';
            });
        }
        
        if (!canDelete) {
            // Ẩn các nút xóa
            document.querySelectorAll('.btn-delete, #sc-btn-delete-selected').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    } else if (moduleName === 'phieucat') {
        // Áp dụng quyền cho phiếu cắt
        if (!canEdit) {
            // Ẩn các nút thêm và sửa
            document.querySelectorAll('.btn-primary, .btn-edit').forEach(btn => {
                btn.style.display = 'none';
            });
        }
        
        if (!canDelete) {
            // Ẩn các nút xóa
            document.querySelectorAll('.btn-delete, #cat-btn-delete-selected').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }
}

//todo Áp dụng quyền chỉnh sửa và xóa================================================
function applyEditDeletePermissions(permissions) {
    // Kiểm tra quyền cho phiếu sang cuộn
    if (permissions['phieu-sang-cuon']) {
        const canEdit = permissions['phieu-sang-cuon'].canEdit;
        const canDelete = permissions['phieu-sang-cuon'].canDelete;
        
        // Áp dụng quyền chỉnh sửa
        if (!canEdit) {
            // Ẩn tab thêm phiếu
            const themPhieuTab = document.querySelector('[onclick*="switchSubTab(\'sc-them\')"]');
            if (themPhieuTab) {
                themPhieuTab.style.display = 'none';
            }
            
            // Ẩn các nút sửa
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.style.display = 'none';
            });
        }
        
        // Áp dụng quyền xóa
        if (!canDelete) {
            // Ẩn các nút xóa
            document.querySelectorAll('.btn-delete, #sc-btn-delete-selected').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }
    
    // Kiểm tra quyền cho phiếu cắt
    if (permissions['phieu-cat']) {
        const canEdit = permissions['phieu-cat'].canEdit;
        const canDelete = permissions['phieu-cat'].canDelete;
        
        // Áp dụng quyền chỉnh sửa
        if (!canEdit) {
            // Ẩn tab thêm phiếu
            const themPhieuTab = document.querySelector('[onclick*="switchSubTab(\'cat-them\')"]');
            if (themPhieuTab) {
                themPhieuTab.style.display = 'none';
            }
            
            // Ẩn các nút sửa
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.style.display = 'none';
            });
        }
        
        // Áp dụng quyền xóa
        if (!canDelete) {
            // Ẩn các nút xóa
            document.querySelectorAll('.btn-delete, #cat-btn-delete-selected').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }
}

//! =================================================================
//! ĐĂNG XUẤT
//  Mô tả: Xử lý đăng xuất tài khoản
//! =================================================================

//TODO Đăng xuất tài khoản========================================================================
function logout() {
    // Hiển thị xác nhận trước khi đăng xuất
    if (confirm('Đăng xuất sẽ xóa hết dữ liệu lưu trữ. Bạn có chắc chắn muốn đăng xuất?')) {
        // Xóa thông tin đăng nhập
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userPermissions');
        
        // Xóa tất cả dữ liệu form GMC đã lưu
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('gmcFormData_machine_') || key.startsWith('inFormData_'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Xóa cookie đăng nhập
        document.cookie = 'userLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Chuyển hướng đến trang đăng nhập
        window.location.href = '/login/login.html';
    }
}