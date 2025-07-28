//! =================================================================
//! UTILITY FUNCTIONS
//  Mô tả: Các hàm tiện ích
//! =================================================================

//TODO Kiểm tra xem có phải trang admin không
function isAdminPage() {
    // Nếu có flag user interface thì không phải admin page
    if (window.isUserInterface) {
        return false;
    }
    
    // Kiểm tra URL hoặc elements đặc trưng của trang admin
    const currentPath = window.location.pathname;
    const isAdminPath = currentPath.includes('/admin/') || currentPath.includes('admin.html');
    
    // Kiểm tra có sidebar admin không (element đặc trưng của trang admin)
    const adminSidebar = document.querySelector('.sidebar .sidebar-nav');
    
    // Kiểm tra có admin container không
    const adminContainer = document.querySelector('.admin-container');
    
    return isAdminPath || (adminSidebar && adminContainer);
}





//! ====================================================================================================================================
//! =================================================================
//! KHỞI TẠO ỨNG DỤNG
//  Mô tả: Khởi tạo ứng dụng, gắn sự kiện cho các phần tử khi trang được load
//! =================================================================
document.addEventListener('DOMContentLoaded', function() {
    
    
    // Chỉ kiểm tra quyền admin khi ở trang admin
    if (isAdminPage()) {
        checkAuthentication();
        
        // Tải dữ liệu ban đầu chỉ khi ở trang admin
        loadUsers();
        loadDepartments();
        loadSystems();
        loadModules();
        loadCustomers();
        loadPermissions();
    }
    
    // Tải dữ liệu ban đầu
    loadUsers();
    loadDepartments();
    loadSystems();
    loadModules();
    loadCustomers();
    loadPermissions();

    // Thêm xử lý cho tab user-interface
    const userInterfaceTab = document.querySelector('[data-tab="user-interface"]');
    if (userInterfaceTab) {
        userInterfaceTab.addEventListener('click', function() {
            handleSidebarClick('user-interface', this);
        });
    }
    
    // Gắn sự kiện cho sidebar với loading effect
document.querySelectorAll('.sidebar-nav li[data-tab]').forEach(item => {
    item.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        handleSidebarClick(tabName, this);
    });
});
    
    // Sự kiện đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // Sự kiện nút thêm hệ thống
    const addSystemBtn = document.getElementById('add-system-btn');
    if (addSystemBtn) {
        addSystemBtn.onclick = function() {
            openSystemModal();
        };
    }
 
    // Sự kiện nút thêm module
    const addModuleBtn = document.getElementById('add-module-btn');
    if (addModuleBtn) {
        addModuleBtn.onclick = function() {
            openModuleModal();
        };
    }



    // Sự kiện đóng modal khi nhấn nút Cancel cho system
const cancelSystemBtn = document.getElementById('cancel-system-btn');
if (cancelSystemBtn) {
    cancelSystemBtn.addEventListener('click', function() {
        closeAllModals();
    });
}

// Sự kiện đóng modal khi nhấn nút Cancel cho module  
const cancelModuleBtn = document.getElementById('cancel-module-btn');
if (cancelModuleBtn) {
    cancelModuleBtn.addEventListener('click', function() {
        closeAllModals();
    });
}


    // Sự kiện submit form hệ thống
const systemForm = document.getElementById('system-form');
if (systemForm) {
    systemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSystem();
    });
}

// Sự kiện submit form module
const moduleForm = document.getElementById('module-form');
if (moduleForm) {
    moduleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveModule();
    });
}

    // Sự kiện cho tab nhà máy
    document.querySelectorAll('.user-factory-tabs .tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Loại bỏ active từ tất cả các tab
            document.querySelectorAll('.user-factory-tabs .tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active cho tab hiện tại
            this.classList.add('active');
            
            // Lọc danh sách người dùng theo nhà máy
            const factoryTab = this.getAttribute('data-factory-tab');
            loadUsersByFactory(factoryTab);
        });
    });
    
    // Sự kiện mở modal thêm người dùng
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            openUserModal();
        });
    }
    
    // Đảm bảo các nút cancel hoạt động đúng
    document.getElementById('cancel-system-btn').addEventListener('click', function() {
        closeAllModals();
    });

    document.getElementById('cancel-module-btn').addEventListener('click', function() {
        closeAllModals();
    });

    // Đảm bảo các nút đóng modal hoạt động 
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Sự kiện đóng modal khi nhấn nút Cancel
    const cancelUserBtn = document.getElementById('cancel-user-btn');
    if (cancelUserBtn) {
        cancelUserBtn.addEventListener('click', function() {
            closeAllModals();
        });
    }
    
    const cancelDepartmentBtn = document.getElementById('cancel-department-btn');
    if (cancelDepartmentBtn) {
        cancelDepartmentBtn.addEventListener('click', function() {
            closeAllModals();
        });
    }
    
    // Sự kiện submit form người dùng
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }
    
    // Sự kiện hiển thị/ẩn mật khẩu trong modal
    const passwordToggle = document.querySelector('.password-toggle-modal');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const passwordInput = document.getElementById('user-password');
            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    passwordInput.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            }
        });
    }
    
    // Sự kiện cho tab phân quyền
    document.querySelectorAll('.tab[data-permission-tab]').forEach(tab => {
        tab.addEventListener('click', function() {
            // Loại bỏ active từ tất cả các tab
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active cho tab hiện tại
            this.classList.add('active');
            
            // Hiển thị nội dung tab tương ứng
            const tabContentId = this.getAttribute('data-permission-tab') + '-content';
            document.querySelectorAll('.permissions-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabContent = document.getElementById(tabContentId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    
    // Sự kiện cho selector phòng ban trong phân quyền người dùng
    const deptPermSelect = document.getElementById('department-permission-select');
    if (deptPermSelect) {
        deptPermSelect.addEventListener('change', function() {
            const department = this.value;
            updateUserPermissionsTable(department);
        });
    }
    
    // Sự kiện cho selector người dùng trong phân quyền
    const userPermSelect = document.getElementById('user-permission-select');
    if (userPermSelect) {
        userPermSelect.addEventListener('change', function() {
            const userId = this.value;
            if (userId) {
                const container = document.querySelector('.user-permissions-container');
                if (container) {
                    container.style.display = 'block';
                }
                loadUserPermissions(userId);
            } else {
                const container = document.querySelector('.user-permissions-container');
                if (container) {
                    container.style.display = 'none';
                }
            }
        });
    }
    
    // Sự kiện lưu phân quyền phòng ban
    const saveDeptPermBtn = document.getElementById('save-department-permissions');
    if (saveDeptPermBtn) {
        saveDeptPermBtn.addEventListener('click', function() {
            saveDepartmentPermissions();
        });
    }
    
    // Sự kiện lưu phân quyền người dùng
    const saveUserPermBtn = document.getElementById('save-user-permissions');
    if (saveUserPermBtn) {
        saveUserPermBtn.addEventListener('click', function() {
            saveUserPermissions();
        });
    }
    
    // Sự kiện lưu cài đặt Master Data
    const saveMasterDataBtn = document.getElementById('save-master-data-settings');
    if (saveMasterDataBtn) {
        saveMasterDataBtn.addEventListener('click', function() {
            saveMasterDataSettings();
        });
    }
    
    // Sự kiện khôi phục cài đặt mặc định
    const resetMasterDataBtn = document.getElementById('reset-master-data-settings');
    if (resetMasterDataBtn) {
        resetMasterDataBtn.addEventListener('click', function() {
            resetMasterDataSettings();
        });
    }
    
    // Sự kiện tự động đăng xuất
    const autoLogoutCheck = document.getElementById('auto-logout');
    if (autoLogoutCheck) {
        autoLogoutCheck.addEventListener('change', function() {
            const logoutTimeSelect = document.getElementById('logout-time');
            if (logoutTimeSelect) {
                logoutTimeSelect.disabled = !this.checked;
            }
        });
    }
    
    // Sự kiện thêm phòng ban - Đảm bảo chỉ gán sự kiện một lần
    const addDepartmentBtn = document.getElementById('add-department-btn');
    if (addDepartmentBtn && !addDepartmentBtn.hasEventListener) {
        addDepartmentBtn.hasEventListener = true;
        addDepartmentBtn.addEventListener('click', function() {
            openDepartmentModal();
        });
    }
    
    // Sự kiện submit form phòng ban
    const departmentForm = document.getElementById('department-form');
    if (departmentForm) {
        departmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveDepartment();
        });
    }
    
    // Sự kiện đóng thông báo
    const toastClose = document.querySelector('.toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', function() {
            hideToast();
        });
    }
    
    // Sự kiện tìm kiếm người dùng
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            filterUsers();
        });
    }
    
    // Sự kiện lọc người dùng
    const deptFilter = document.getElementById('department-filter');
    if (deptFilter) {
        deptFilter.addEventListener('change', function() {
            filterUsers();
        });
    }
    
    const roleFilter = document.getElementById('role-filter');
    if (roleFilter) {
        roleFilter.addEventListener('change', function() {
            filterUsers();
        });
    }
    
    // Sự kiện cho tab danh mục khách hàng
    document.querySelectorAll('.tab[data-customer-tab]').forEach(tab => {
        tab.addEventListener('click', function() {
            // Loại bỏ active từ tất cả các tab
            document.querySelectorAll('.tab[data-customer-tab]').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active cho tab hiện tại
            this.classList.add('active');
            
            // Hiển thị nội dung tab tương ứng
            const tabContentId = this.getAttribute('data-customer-tab') + '-content';
            document.querySelectorAll('.customer-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabContent = document.getElementById(tabContentId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    
    // Sự kiện cho nút nhập từ Excel
    const importExcelBtn = document.getElementById('import-excel-btn');
    if (importExcelBtn) {
        importExcelBtn.addEventListener('click', function() {
            const fileInput = document.getElementById('excel-file-input');
            if (fileInput) {
                fileInput.click();
            }
        });
    }
    
    // Xử lý file Excel khi người dùng chọn file
    const excelFileInput = document.getElementById('excel-file-input');
    if (excelFileInput) {
        excelFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleExcelFile(e.target.files[0]);
            }
        });
    }
    

    
    // Sự kiện lưu dữ liệu khách hàng và hủy nhập
    const saveCustomersBtn = document.getElementById('save-customers-btn');
    if (saveCustomersBtn) {
        saveCustomersBtn.addEventListener('click', saveCustomersData);
    }
    
    const cancelImportBtn = document.getElementById('cancel-import-btn');
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', cancelImport);
    }
    
    // Load data cho tab hệ thống phần mềm
    const systemManagementTab = document.querySelector('.sidebar-nav li[data-tab="system-management"]');
    if (systemManagementTab) {
        systemManagementTab.addEventListener('click', function() {
            loadSystems();
            loadModules();
        });
    }
    
    // Thiết lập các nút chỉnh sửa phòng ban
    setupEditDepartmentButtons();
    
    // Khởi tạo dữ liệu và giao diện
    initAdminPanel();

    // Thêm phần xử lý toggle sidebar
    initSidebarToggle();

    // Xử lý URL parameters để chuyển tab tự động
    handleUrlParameters();


    // Kiểm tra và thêm event cho toggle interface button (tránh lỗi null)
setTimeout(() => {
    const toggleBtn = document.getElementById('toggle-interface-btn');
    if (toggleBtn && !toggleBtn.hasEventListener) {
        toggleBtn.hasEventListener = true;
        toggleBtn.addEventListener('click', function() {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/admin/')) {
                window.location.href = '/user/';
            } else {
                window.location.href = '/admin/admin.html';
            }
        });
    }
}, 500);


});


// Thêm function này vào admin.js
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam) {
        // Chờ một chút để đảm bảo trang đã load xong
        setTimeout(() => {
            const targetTab = document.querySelector(`[data-tab="${tabParam}"]`);
            if (targetTab && typeof handleSidebarClick === 'function') {
                handleSidebarClick(tabParam, targetTab);
                
                // Xóa parameter khỏi URL sau khi đã xử lý
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }, 500);
    }
}






//TODO  Khởi tạo dữ liệu và giao diện====================================================================================================================================
function initAdminPanel() {

    // Chỉ khởi tạo khi ở trang admin
    if (!isAdminPage()) {
        return;
    }


    // Show initial loading
    showLoading('Đang khởi tạo trang quản trị...', 'Đang tải các thành phần giao diện...');
    
    // Hiển thị thông tin admin
    const adminName = safeGetElement('admin-name');
    const currentUser = getCurrentUser();
    if (adminName && currentUser) {
      adminName.textContent = currentUser.fullname || currentUser.username || 'Admin';
    }
    
    // Tải dữ liệu ban đầu
    Promise.all([
        loadDepartments(),
        loadUsers(),
        // loadAdminDashboardSystems(), // Load systems cho dashboard
        loadSystems(),
        loadModules(),
        loadCustomers(),
        loadDinhMuc(),
        loadWsTong() 
    ]).then(() => {
        // Hide loading after all data is loaded
        setTimeout(() => {
            hideLoading();
        }, 500);
    }).catch(error => {
        console.error("Lỗi khi khởi tạo dữ liệu admin:", error);
        hideLoading();
        showToast('Có lỗi khi tải dữ liệu ban đầu!', 'error');
    });


    // Xóa event listener đăng xuất trùng lặp từ auth.js
const existingLogoutBtn = document.getElementById('logout-btn');
if (existingLogoutBtn) {
    // Clone node để xóa tất cả event listeners
    const newLogoutBtn = existingLogoutBtn.cloneNode(true);
    existingLogoutBtn.parentNode.replaceChild(newLogoutBtn, existingLogoutBtn);
    
    // Gán lại event listener mới
    newLogoutBtn.addEventListener('click', function() {
        logout();
    });
}


setupWsTongExcelEvents();


}

//TODO  Đóng tất cả các modal====================================================================================================================================
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

//todo Hàm xử lý toggle sidebar==========================================================================================================
// Hàm xử lý toggle sidebar
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const adminContainer = document.querySelector('.admin-container');
    
    // Thêm data-title cho các mục menu để hiển thị tooltip khi thu gọn
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        const titleText = item.querySelector('span')?.textContent || '';
        item.setAttribute('data-title', titleText);
    });
    
    // Kiểm tra và phục hồi trạng thái sidebar từ localStorage
    if(localStorage.getItem('sidebarCollapsed') === 'true') {
        adminContainer.classList.add('sidebar-collapsed');
        if(toggleBtn) toggleBtn.querySelector('i').classList.remove('fa-bars');
        if(toggleBtn) toggleBtn.querySelector('i').classList.add('fa-bars');
    }
    
    // Xử lý sự kiện khi nhấn nút toggle
    if(toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            adminContainer.classList.toggle('sidebar-collapsed');
            
            // Lưu trạng thái sidebar vào localStorage
            const isCollapsed = adminContainer.classList.contains('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            
            // Đổi hướng icon
            const icon = this.querySelector('i');
            if(isCollapsed) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-bars');
            }
        });
    }
}





//! ====================================================================================================================================

//! =================================================================
//! AUTHENTICATION & AUTHORIZATION
//  Mô tả: Kiểm tra đăng nhập, lấy thông tin người dùng, phân quyền và đăng xuất
//! =================================================================

//todo Kiểm tra đăng nhập và phân quyền========================================================================
function checkAuthentication() {
    // Chỉ kiểm tra quyền admin nếu thực sự cần
    if (!isAdminPage()) {
        return; // Thoát ra nếu không phải trang admin
    }
    
    const currentUser = getCurrentUser();
    const userPermissions = getUserPermissions();
    
    if (!currentUser) {
        // Chuyển hướng đến trang đăng nhập
        window.location.href = '/login/login.html';
        return;
    }
    
    // Kiểm tra quyền admin
    if (!userPermissions || !userPermissions.isAdmin) {
        // Hiển thị thông báo không có quyền
        showToast('Bạn không có quyền truy cập trang quản trị!', 'error');
        
        // Chuyển hướng sau 2 giây
        setTimeout(() => {
            window.location.href = '/user/';
        }, 2000);
        return;
    }
}

//todo Lấy thông tin người dùng hiện tại từ session storage========================================================================
function getCurrentUser() {
    const userString = sessionStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
}

//todo Lấy quyền truy cập từ session storage========================================================================
function getUserPermissions() {
    const permissionsString = sessionStorage.getItem('userPermissions');
    return permissionsString ? JSON.parse(permissionsString) : null;
}

//todo Đăng xuất========================================================================
function logout() {
    // Kiểm tra xem đã có confirm dialog nào đang hiển thị không
    if (window.logoutInProgress) {
        return;
    }
    
    window.logoutInProgress = true;
    
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
    } else {
        window.logoutInProgress = false;
    }
}





//! ====================================================================================================================================
//! =================================================================
//! LOADING ENHANCEMENT FUNCTIONS
//  Mô tả: Các hàm xử lý loading khi chuyển tab
//! =================================================================

// Show loading overlay
function showLoading(text = 'Đang tải dữ liệu...', subtext = 'Vui lòng đợi trong giây lát') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const loadingSubtext = document.getElementById('loading-subtext');
    
    if (overlay) {
        if (loadingText) loadingText.textContent = text;
        if (loadingSubtext) loadingSubtext.textContent = subtext;
        overlay.classList.add('show');
    }
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// Cập nhật hàm switchTabWithLoading để xử lý tab user-interface
function switchTabWithLoading(tabName, loadingText = 'Đang tải dữ liệu...') {
    return new Promise((resolve) => {
        // Show loading
        showLoading(loadingText, 'Đang chuẩn bị nội dung...');
        
        // Add loading class to clicked tab
        const clickedTab = document.querySelector(`.sidebar-nav li[data-tab="${tabName}"]`);
        if (clickedTab) {
            clickedTab.classList.add('loading');
        }
        
        // Fade out current content
        const currentTab = document.querySelector('.content-tab.active');
        if (currentTab) {
            currentTab.classList.add('fade-out');
        }
        
        // Wait for fade out animation
        setTimeout(() => {
            // Remove active from all tabs and sidebar items
            document.querySelectorAll('.sidebar-nav li').forEach(nav => {
                nav.classList.remove('active', 'loading');
            });
            document.querySelectorAll('.content-tab').forEach(tab => {
                tab.classList.remove('active', 'fade-out');
            });
            
            // Add active to new tab and sidebar item
            if (clickedTab) {
                clickedTab.classList.add('active');
            }
            
            const newTabContent = document.getElementById(tabName + '-tab');
            if (newTabContent) {
                newTabContent.classList.add('active', 'fade-in');
            }

            // Xử lý đặc biệt cho tab user-interface: ẩn top-bar
            const topBar = document.querySelector('.top-bar');
            if (tabName === 'user-interface') {
                if (topBar) topBar.style.display = 'none';
            } else {
                if (topBar) topBar.style.display = 'flex';
            }
            
            // Simulate data loading time and actually load data
            loadTabData(tabName).then(() => {
                setTimeout(() => {
                    hideLoading();
                    resolve();
                }, 200);
            });
            
        }, 100);
    });
}


// Load data for specific tab
async function loadTabData(tabName) {
    try {
        switch(tabName) {
            case 'dashboard':
    await loadUsers(); // Load stats
    // await loadAdminUserSystems(); // Load giao diện user với quyền admin
    break;
                case 'user-interface':
                    await loadAdminUserInterface();
                    break;
            case 'users':
                await loadUsers();
                await loadDepartments();
                break;
            case 'departments':
                await loadDepartments();
                break;
            case 'system-management':
                await loadSystems();
                await loadModules();
                break;
            case 'permissions':
                await loadPermissions();
                await loadDepartments();
                break;
            case 'master-data':
                await loadCustomers();
                await loadDinhMuc();
                break;
                case 'planning':
    await loadWsTong();
    break;
            default:
                console.log('No specific data loading for tab:', tabName);
        }
    } catch (error) {
        console.error('Error loading tab data:', error);
        showToast('Có lỗi khi tải dữ liệu!', 'error');
    }
}

// Enhanced sidebar click handler
function handleSidebarClick(tabName, element) {
    // Prevent multiple clicks
    if (element.classList.contains('loading')) {
        return;
    }
    
    const loadingMessages = {
        'dashboard': 'Đang tải thông tin tổng quan...',
        'user-interface': 'Đang tải giao diện người dùng...',
        'users': 'Đang tải danh sách người dùng...',
        'departments': 'Đang tải thông tin phòng ban...',
        'system-management': 'Đang tải hệ thống phần mềm...',
        'permissions': 'Đang tải thông tin phân quyền...',
        'master-data': 'Đang tải dữ liệu master...'
    };
    
    const loadingText = loadingMessages[tabName] || 'Đang tải dữ liệu...';
    
    switchTabWithLoading(tabName, loadingText);
}







//! ====================================================================================================================================

//! =================================================================
//! QUẢN LÝ NGƯỜI DÙNG
//  Mô tả: Quản lý danh sách người dùng, thêm, sửa, xóa và reset mật khẩu người dùng
//! =================================================================

//TODO Tải danh sách người dùng========================================================================
async function loadUsers() {
    // Chỉ tải khi ở trang admin hoặc khi được gọi explicitly
    if (!isAdminPage() && !document.getElementById('users-list')) {
        return [];
    }

    try {
      const usersList = safeGetElement('users-list');
      if (!usersList) {
        console.warn('Element #users-list not found');
        return [];
      }
      
      // Show loading indicator
      usersList.innerHTML = '<tr><td colspan="9" class="text-center">Đang tải dữ liệu người dùng...</td></tr>';
      
      const response = await fetch('/api/users/list');
      
      if (!response.ok) {
        let errorMsg = 'Không thể lấy danh sách người dùng';
        try {
          if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            errorMsg = data.error || errorMsg;
          }
        } catch {}
        
        usersList.innerHTML = `<tr><td colspan="9" class="text-center" style="color: red;">Lỗi: ${errorMsg}</td></tr>`;
        return [];
      }
      
      const users = await response.json();
      
      if (!Array.isArray(users)) {
        usersList.innerHTML = '<tr><td colspan="9" class="text-center" style="color: red;">Dữ liệu người dùng không hợp lệ</td></tr>';
        return [];
      }
      
      // Lưu danh sách người dùng vào biến toàn cục để sử dụng khi lọc
      window.allUsers = users;
      
      // Cập nhật số lượng người dùng trên dashboard
      const userCount = safeGetElement('user-count');
      if (userCount) {
        userCount.textContent = users.length;
      }
      
      // Hiển thị danh sách tất cả người dùng
      displayUsers(users);
      
      // Cập nhật selector phân quyền người dùng
      const userSelector = safeGetElement('user-permission-select');
      if (userSelector) {
        updateUserPermissionSelector(users);
      }
      
      return users;
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      const usersList = safeGetElement('users-list');
      if (usersList) {
        usersList.innerHTML = `<tr><td colspan="9" class="text-center" style="color: red;">Lỗi: ${error.message}</td></tr>`;
      }
      return [];
    }
}





//TODO Hiển thị danh sách người dùng========================================================================
function displayUsers(users) {
    const usersList = safeGetElement('users-list');
    if (!usersList) {
      console.warn('Element #users-list not found');
      return;
    }
    
    usersList.innerHTML = '';
    
    if (!users || users.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="9" class="text-center">Không có dữ liệu người dùng</td>';
      usersList.appendChild(emptyRow);
      return;
    }
    
    users.forEach(user => {
      try {
        const row = document.createElement('tr');
        
        // Format ngày tạo
        let formattedDate = '';
        try {
          if (user.created_at) {
            const createdDate = new Date(user.created_at);
            if (!isNaN(createdDate.getTime())) {
              formattedDate = `${createdDate.getDate().toString().padStart(2, '0')}/${(createdDate.getMonth() + 1).toString().padStart(2, '0')}/${createdDate.getFullYear()}`;
            } else {
              formattedDate = 'Ngày không hợp lệ';
            }
          }
        } catch (dateError) {
          console.warn('Lỗi khi format ngày:', dateError);
          formattedDate = 'N/A';
        }
        
        // Tạo badge nhà máy với màu khác nhau
        const nhaMayClass = user.nhaMay === 'Nhà máy 3' ? 'nhaMay-3' : 'nhaMay-1-2';
        const nhaMayBadge = `<span class="nhaMay-badge ${nhaMayClass}">${user.nhaMay || 'Không xác định'}</span>`;

        // Tạo badge Ca với màu khác nhau
        const caClass = user.ca === 'A' ? 'ca-a' : user.ca === 'B' ? 'ca-b' : 'ca-hc';
        const caBadge = `<span class="ca-badge ${caClass}">${user.ca || 'A'}</span>`;
        
        // <td>${user.id || ''}</td>
        row.innerHTML = `
          <td>${user.employee_id || ''}</td>
          <td>${user.fullname || ''}</td>
          <td>${user.role === 'admin' ? 'Admin' : 'User'}</td>
          <td>${user.department || ''}</td>
          <td>${user.position || ''}</td>
          <td>${nhaMayBadge}</td>
          <td>${caBadge}</td>
          <td>${formattedDate}</td>
          <td class="actions">
            <button class="btn-edit" onclick="editUser('${user.id}')" title="Chỉnh sửa">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-reset-password" onclick="resetUserPassword('${user.id}')" title="Đặt lại mật khẩu">
              <i class="fas fa-key"></i>
            </button>
            <button class="btn-delete" onclick="deleteUser('${user.id}')" title="Xóa">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        
        usersList.appendChild(row);
      } catch (error) {
        console.error('Lỗi khi hiển thị người dùng:', error);
      }
    });
}

//TODO Lọc danh sách người dùng========================================================================
function filterUsers() {
    // Nếu chưa tải danh sách người dùng
    if (!window.allUsers) return;
    
    const keyword = document.getElementById('user-search').value.toLowerCase();
    const departmentFilter = document.getElementById('department-filter').value;
    const roleFilter = document.getElementById('role-filter').value;
    
    // Xác định tab nhà máy đang active
    const activeTab = document.querySelector('.user-factory-tabs .tab.active');
    const factoryTab = activeTab ? activeTab.getAttribute('data-factory-tab') : 'all-users';
    
    let filteredUsers = [...window.allUsers];
    
    // Lọc theo tab nhà máy
    if (factoryTab === 'vsp-users') {
        filteredUsers = filteredUsers.filter(user => user.nhaMay === 'Nhà máy 1+2');
    } else if (factoryTab === 'pvn-users') {
        filteredUsers = filteredUsers.filter(user => user.nhaMay === 'Nhà máy 3');
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (keyword) {
        filteredUsers = filteredUsers.filter(user => {
            const fullname = (user.fullname || '').toLowerCase();
            const employeeId = (user.employee_id || '').toLowerCase();
            const department = (user.department || '').toLowerCase();
            
            return fullname.includes(keyword) || 
                   employeeId.includes(keyword) || 
                   department.includes(keyword);
        });
    }
    
    // Lọc theo phòng ban
    if (departmentFilter) {
        filteredUsers = filteredUsers.filter(user => 
            user.department && user.department.toLowerCase() === departmentFilter.toLowerCase()
        );
    }
    
    // Lọc theo vai trò
    if (roleFilter) {
        filteredUsers = filteredUsers.filter(user => 
            user.role && user.role.toLowerCase() === roleFilter.toLowerCase()
        );
    }
    
    // Hiển thị kết quả lọc
    displayUsers(filteredUsers);
}

//TODO Mở modal thêm/sửa người dùng========================================================================
function openUserModal(userId = null) {
    // Đặt lại form
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    
    // Đặt tiêu đề cho modal và trạng thái các trường
    document.getElementById('user-modal-title').textContent = 'Thêm người dùng mới';
    document.getElementById('user-password').required = true;
    document.querySelector('#user-form .password-toggle-modal').innerHTML = '<i class="fas fa-eye"></i>';
    
    // Hiện trường nhà máy cho người dùng mới, mặc định là Nhà máy 1+2
    document.getElementById('user-nha-may').value = 'Nhà máy 1+2';
    document.getElementById('user-nha-may').disabled = false;

    // Mặc định Ca là A
    document.getElementById('ca').value = 'A';
    
    // Tạo trường employee ID dựa vào nhà máy đã chọn
    generateEmployeeId();
    
    if (userId) {
        // Sửa người dùng - lấy thông tin từ API
        document.getElementById('user-modal-title').textContent = 'Chỉnh sửa người dùng';
        document.getElementById('user-id').value = userId;
        document.getElementById('user-password').required = false;
        
        // Lấy thông tin người dùng từ API
        fetch(`/api/users/list`).then(response => response.json())
        .then(users => {
            const user = users.find(u => u.id === userId);
            
            if (user) {
                document.getElementById('user-nha-may').value = user.nhaMay || 'Nhà máy 1+2';
                document.getElementById('user-employee-id').value = user.employee_id || '';
                document.getElementById('user-fullname').value = user.fullname || '';
                document.getElementById('user-role').value = user.role || 'user';
                document.getElementById('user-department').value = user.department || '';
                document.getElementById('user-position').value = user.position || '';
                document.getElementById('ca').value = user.ca || 'A';
                
                // Khi chỉnh sửa, không cho phép đổi nhà máy (cần tạo người dùng mới)
                document.getElementById('user-nha-may').disabled = true;
            }
        })
        .catch(error => {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            showToast('Lỗi khi lấy thông tin người dùng!', 'error');
        });
    }
    
    // Hiển thị modal
    document.getElementById('user-modal').style.display = 'block';
}

//TODO Thêm/cập nhật người dùng========================================================================
async function saveUser() {
    try {
        const userId = document.getElementById('user-id').value;
        const nhaMay = document.getElementById('user-nha-may').value;
        const password = document.getElementById('user-password').value;
        const fullname = document.getElementById('user-fullname').value;
        const role = document.getElementById('user-role').value;
        const department = document.getElementById('user-department').value;
        const position = document.getElementById('user-position').value;
        const ca = document.getElementById('ca').value;
        
        if (!fullname) {
            showToast('Vui lòng nhập họ tên!', 'error');
            return;
        }

        if (!ca) {
            showToast('Vui lòng chọn ca!', 'error');
            return;
        }
        
        if (!userId && !password) {
            showToast('Vui lòng nhập mật khẩu!', 'error');
            return;
        }
        
        // Tạo object dữ liệu
        const userData = {
            nhaMay,
            fullname,
            role,
            department,
            position,
            ca
        };
        
        if (password) {
            userData.password = password;
        }
        
        // Gọi API tương ứng
        let response;
        if (userId) {
            // Cập nhật người dùng
            response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
        } else {
            // Thêm người dùng mới
            response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi lưu người dùng');
        }
        
        const responseData = await response.json();
        
        // Đóng modal và tải lại danh sách
        closeAllModals();
        loadUsers();
        
        // Hiển thị thông báo thành công với thông tin thêm về nhân viên mới (nếu có)
        const successMessage = userId ? 
            'Đã cập nhật người dùng thành công!' : 
            `Đã thêm người dùng mới thành công! Mã nhân viên: ${responseData.employeeId || 'N/A'}`;
        
        showToast(successMessage);
    } catch (error) {
        console.error('Lỗi khi lưu người dùng:', error);
        showToast(error.message, 'error');
    }
}

//TODO Xóa người dùng========================================================================
function deleteUser(userId) {
    // Hiển thị modal xác nhận
    const confirmModal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').textContent = 'Xác nhận xóa';
    document.getElementById('confirm-message').textContent = 'Bạn có chắc chắn muốn xóa người dùng này?';
    
    // Gắn sự kiện cho nút xác nhận
    document.getElementById('confirm-yes').onclick = async function() {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Lỗi khi xóa người dùng');
            }
            
            // Đóng modal và tải lại danh sách
            closeAllModals();
            loadUsers();
            
            showToast('Đã xóa người dùng thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            showToast(error.message, 'error');
            closeAllModals();
        }
    };
    
    // Gắn sự kiện cho nút hủy
    document.getElementById('confirm-no').onclick = function() {
        closeAllModals();
    };
    
    // Hiển thị modal
    confirmModal.style.display = 'block';
}

//TODO Đặt lại mật khẩu========================================================================
function resetUserPassword(userId) {
    // Hiển thị modal xác nhận
    const confirmModal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').textContent = 'Đặt lại mật khẩu';
    document.getElementById('confirm-message').textContent = 'Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này?';
    
    // Gắn sự kiện cho nút xác nhận
    document.getElementById('confirm-yes').onclick = async function() {
        try {
            // Tạo mật khẩu mặc định là "123456"
            const defaultPassword = '123456';
            
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: defaultPassword
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Lỗi khi đặt lại mật khẩu');
            }
            
            // Đóng modal
            closeAllModals();
            
            showToast('Đã đặt lại mật khẩu thành "123456" thành công!');
        } catch (error) {
            console.error('Lỗi khi đặt lại mật khẩu:', error);
            showToast(error.message, 'error');
            closeAllModals();
        }
    };
    
    // Gắn sự kiện cho nút hủy
    document.getElementById('confirm-no').onclick = function() {
        closeAllModals();
    };
    
    // Hiển thị modal
    confirmModal.style.display = 'block';
}

//TODO Hàm tạo mã nhân viên từ server và hiển thị========================================================================
async function generateEmployeeId() {
    try {
        const nhaMay = document.getElementById('user-nha-may').value;
        
        // Gọi API để lấy mã nhân viên tiếp theo
        const response = await fetch('/api/users/next-employee-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nhaMay })
        });
        
        if (!response.ok) {
            throw new Error('Không thể lấy mã nhân viên');
        }
        
        const data = await response.json();
        
        // Hiển thị mã nhân viên lên form
        document.getElementById('user-employee-id').value = data.employeeId;
    } catch (error) {
        console.error('Lỗi khi tạo mã nhân viên:', error);
        // Nếu có lỗi, tạo mã dự phòng dựa vào nhà máy
        const nhaMay = document.getElementById('user-nha-may').value;
        const prefix = nhaMay === 'Nhà máy 3' ? 'PVN' : 'VSP';
        document.getElementById('user-employee-id').value = `${prefix}-XXXX`;
    }
}

//todo Tải danh sách người dùng theo nhà máy========================================================================
async function loadUsersByFactory(factoryTab) {
    try {
        let nhaMay = '';
        
        // Xác định nhà máy dựa vào tab đã chọn
        if (factoryTab === 'vsp-users') {
            nhaMay = 'Nhà máy 1+2';
        } else if (factoryTab === 'pvn-users') {
            nhaMay = 'Nhà máy 3';
        }
        
        if (nhaMay) {
            // Lấy danh sách người dùng theo nhà máy cụ thể
            const response = await fetch(`/api/users/list?nhaMay=${encodeURIComponent(nhaMay)}`);
            if (!response.ok) {
                throw new Error(`Không thể lấy danh sách người dùng ${nhaMay}`);
            }
            
            const users = await response.json();
            displayUsers(users);
        } else {
            // Hiển thị tất cả người dùng
            if (window.allUsers) {
                displayUsers(window.allUsers);
            } else {
                // Tải lại danh sách người dùng
                loadUsers();
            }
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng theo nhà máy:', error);
        showToast('Lỗi khi tải danh sách người dùng!', 'error');
    }
}

//todo Sự kiện khi thay đổi nhà máy========================================================================
document.getElementById('user-nha-may').addEventListener('change', function() {
    generateEmployeeId();
});






//! ====================================================================================================================================

//! =================================================================
//! QUẢN LÝ PHÒNG BAN
//  Mô tả: Quản lý danh sách phòng ban, thêm, sửa phòng ban
//! =================================================================

//TODO Tải danh sách phòng ban========================================================================
async function loadDepartments() {
    try {
      const departmentsList = document.querySelector('.departments-list');
      
      if (!departmentsList) {
        console.warn('Element .departments-list not found');
        return [];
      }
      
      // Add loading indicator
      departmentsList.innerHTML = '<div class="loading-indicator">Đang tải dữ liệu phòng ban...</div>';
      
      const response = await fetch('/api/departments/list');
      
      if (!response.ok) {
        let errorMsg = 'Không thể lấy danh sách phòng ban';
        try {
          if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            errorMsg = data.error || errorMsg;
          }
        } catch {}
        
        departmentsList.innerHTML = `<div class="error-message" style="color: red; padding: 20px; text-align: center;">Lỗi: ${errorMsg}</div>`;
        return [];
      }
      
      const departments = await response.json();
      
      // Cập nhật select filter trong tab user
      const departmentFilter = safeGetElement('department-filter');
      if (departmentFilter) {
        departmentFilter.innerHTML = '<option value="">Tất cả phòng ban</option>';
        
        departments.forEach(dept => {
          const option = document.createElement('option');
          option.value = dept.name;
          option.textContent = dept.name;
          departmentFilter.appendChild(option);
        });
      }
      
      // Cập nhật select filter trong form thêm người dùng
      const userDepartment = safeGetElement('user-department');
      if (userDepartment) {
        userDepartment.innerHTML = '<option value="">-- Chọn phòng ban --</option>';
        
        departments.forEach(dept => {
          const option = document.createElement('option');
          option.value = dept.name;
          option.textContent = dept.name;
          userDepartment.appendChild(option);
        });
      }
      
      // Generate department cards
      departmentsList.innerHTML = '';
      
      if (departments.length === 0) {
        departmentsList.innerHTML = '<div class="empty-state">Chưa có phòng ban nào.</div>';
      } else {
        departments.forEach(dept => {
          const card = document.createElement('div');
          card.className = 'department-card';
          card.innerHTML = `
            <div class="department-info">
              <h3>${dept.name}</h3>
              <p>${dept.description || ''}</p>
            </div>
            <div class="department-stats">
              <div class="stat-item">
                <span class="stat-label">Nhân viên:</span>
                <span class="stat-value">0</span>
              </div>
            </div>
            <div class="department-actions">
              <button class="btn-edit" title="Chỉnh sửa" data-dept-id="${dept.id}" data-dept-name="${dept.name}">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          `;
          
          departmentsList.appendChild(card);
        });
        
        // Set up edit buttons after creating cards
        setupEditDepartmentButtons();
      }
      
      return departments;
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng ban:', error);
      const departmentsList = document.querySelector('.departments-list');
      if (departmentsList) {
        departmentsList.innerHTML = `<div class="error-message" style="color: red; padding: 20px; text-align: center;">Lỗi: ${error.message}</div>`;
      }
      return [];
    }
}

//TODO Mở modal thêm/sửa phòng ban========================================================================
function openDepartmentModal(deptId, deptName) {
    // Reset form
    const form = safeGetElement('department-form');
    if (form) form.reset();
    
    const idInput = safeGetElement('department-id');
    const nameInput = safeGetElement('department-name');
    const descInput = safeGetElement('department-description');
    const titleElement = safeGetElement('department-modal-title');
    
    if (titleElement) {
      titleElement.textContent = deptId ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới';
    }
    
    if (deptId && deptName) {
      // Edit existing department
      if (idInput) idInput.value = deptId;
      if (nameInput) nameInput.value = deptName;
      
      // Find description from DOM
      const deptCards = document.querySelectorAll('.department-card');
      for (let i = 0; i < deptCards.length; i++) {
        const header = deptCards[i].querySelector('h3');
        if (header && header.textContent.trim() === deptName) {
          const descElement = deptCards[i].querySelector('p');
          if (descElement && descInput) {
            descInput.value = descElement.textContent || '';
            break;
          }
        }
      }
      
      // If not found in DOM, try to load from API
      fetch(`/api/departments/list`)
        .then(response => response.json())
        .then(departments => {
          const dept = departments.find(d => d.id === deptId || d.name === deptName);
          if (dept && descInput) {
            descInput.value = dept.description || '';
          }
        })
        .catch(error => console.warn('Error fetching department details:', error));
    } else {
      // New department
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (descInput) descInput.value = '';
    }
    
    // Show modal
    const modal = safeGetElement('department-modal');
    if (modal) modal.style.display = 'block';
}

  //TODO Lưu phòng ban========================================================================
async function saveDepartment() {
    try {
      const deptId = safeGetElement('department-id')?.value;
      const deptName = safeGetElement('department-name')?.value;
      const deptDescription = safeGetElement('department-description')?.value || '';
      
      if (!deptName) {
        showToast('Vui lòng nhập tên phòng ban!', 'error');
        return;
      }
      
      let response;
      
      if (deptId) {
        // Update existing department
        response = await fetch(`/api/departments/${deptId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: deptName,
            description: deptDescription
          }),
        });
      } else {
        // Create new department
        response = await fetch('/api/departments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: deptName,
            description: deptDescription
          }),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi lưu phòng ban');
      }
      
      // Close modal and reload departments
      closeAllModals();
      await loadDepartments();
      
      showToast(deptId ? 'Đã cập nhật phòng ban thành công!' : 'Đã thêm phòng ban mới thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu phòng ban:', error);
      showToast(error.message || 'Lỗi khi lưu phòng ban!', 'error');
    }
}

  //TODO Hàm để gắn sự kiện cho các nút chỉnh sửa phòng ban========================================================================
function setupEditDepartmentButtons() {
    document.querySelectorAll('.department-card .btn-edit').forEach(btn => {
      const deptId = btn.getAttribute('data-dept-id');
      const deptName = btn.getAttribute('data-dept-name');
      
      // Remove old event listeners
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openDepartmentModal(deptId, deptName);
      });
    });
}

//TODO Hàm chỉnh sửa phòng ban (tách riêng để tránh xung đột)========================================================================
function editDepartment(departmentName) {
    console.log("Chỉnh sửa phòng ban:", departmentName);
    
    // Reset form
    const form = document.getElementById('department-form');
    if (form) form.reset();
    
    // Cập nhật tiêu đề
    const titleElement = document.getElementById('department-modal-title');
    if (titleElement) titleElement.textContent = 'Chỉnh sửa phòng ban';
    
    // Cập nhật giá trị form
    const idInput = document.getElementById('department-id');
    const nameInput = document.getElementById('department-name');
    const descInput = document.getElementById('department-description');
    
    if (idInput) idInput.value = departmentName;
    if (nameInput) nameInput.value = departmentName;
    
    // Tìm mô tả
    const cards = document.querySelectorAll('.department-card');
    for (let i = 0; i < cards.length; i++) {
        const header = cards[i].querySelector('h3');
        if (header && header.textContent.trim() === departmentName) {
            const descElement = cards[i].querySelector('p');
            if (descElement && descInput) {
                descInput.value = descElement.textContent;
                break;
            }
        }
    }
    
    // Hiển thị modal
    const modal = document.getElementById('department-modal');
    if (modal) modal.style.display = 'block';
}





//! ====================================================================================================================================

//! =================================================================
//! QUẢN LÝ HỆ THỐNG PHẦN MỀM
//  Mô tả: Quản lý hệ thống và module, thêm, sửa, xóa hệ thống và module
//! =================================================================

//TODO Hàm tải danh sách hệ thống========================================================================
async function loadSystems() {
    try {
        const container = document.getElementById('nested-systems-container');
        if (!container) {
            console.warn('Không tìm thấy phần tử #nested-systems-container');
            return;
        }
        
        // Hiển thị trạng thái đang tải
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Đang tải danh sách hệ thống...</div>';
        
        const response = await fetch('/api/systems/list');
        if (!response.ok) {
            throw new Error('Không thể lấy danh sách hệ thống');
        }
        
        const systems = await response.json();
        
        // Tải modules cho từng hệ thống
        const systemsWithModules = await Promise.all(
            systems.map(async (system) => {
                const modulesResponse = await fetch(`/api/modules/list?system_id=${system.id}`);
                const modules = modulesResponse.ok ? await modulesResponse.json() : [];
                return { ...system, modules };
            })
        );

        // Áp dụng thứ tự từ localStorage nếu có
const savedSystemOrder = JSON.parse(localStorage.getItem('systemOrder') || '[]');
if (savedSystemOrder.length > 0) {
    systemsWithModules.sort((a, b) => {
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
}

// Áp dụng thứ tự module từ localStorage
const savedModuleOrders = JSON.parse(localStorage.getItem('moduleOrders') || '{}');
systemsWithModules.forEach(system => {
    if (savedModuleOrders[system.id] && system.modules) {
        const moduleOrder = savedModuleOrders[system.id];
        system.modules.sort((a, b) => {
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
    }
});
        
        // Hiển thị nested sortable
        displayNestedSortable(systemsWithModules);
        
        // Khởi tạo sortable
        initializeNestedSortable();
        
        return systemsWithModules;
    } catch (error) {
        console.error('Lỗi khi tải danh sách hệ thống:', error);
        const container = document.getElementById('nested-systems-container');
        if (container) {
            container.innerHTML = `<div style="text-align: center; padding: 40px; color: #e74c3c;">Lỗi: ${error.message}</div>`;
        }
        return [];
    }
}



function displayNestedSortable(systems) {
    const container = document.getElementById('nested-systems-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!systems || systems.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    systems.forEach(system => {
        const systemElement = document.createElement('div');
        systemElement.className = 'system-item';
        systemElement.setAttribute('data-system-id', system.id);
        
        // Tạo phần header của hệ thống
        const systemHeader = document.createElement('div');
systemHeader.className = 'system-header';
systemHeader.innerHTML = `
    <div class="system-info">
        <h3>
            <span class="handle"><i class="fas fa-grip-vertical"></i></span>
            ${system.icon ? (system.icon.startsWith('http') ? 
                `<img src="${system.icon}" alt="Icon" style="width: 24px; height: 24px; margin-right: 10px;">` : 
                `<i class="${system.icon}" style="margin-right: 10px;"></i>`) : 
                '<i class="fas fa-cogs" style="margin-right: 10px;"></i>'}
            ${system.name || 'Không tên'}
        </h3>
        <p>${system.description || 'Không có mô tả'}</p>
    </div>
    <div class="system-actions">
        <button class="btn-edit-system" data-system-id="${system.id}" title="Chỉnh sửa hệ thống">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete-system" data-system-id="${system.id}" title="Xóa hệ thống">
            <i class="fas fa-trash"></i>
        </button>
    </div>
`;
        
        // Tạo danh sách modules
        const modulesList = document.createElement('ul');
        modulesList.className = 'modules-list';
        modulesList.setAttribute('data-system-id', system.id);
        
        if (system.modules && system.modules.length > 0) {
            system.modules.forEach(module => {
                const moduleItem = document.createElement('li');
moduleItem.className = 'module-item';
moduleItem.setAttribute('data-module-id', module.id);
moduleItem.innerHTML = `
    <div class="module-info">
        <span class="handle"><i class="fas fa-grip-vertical"></i></span>
        <div class="module-details">
            <h4>
                ${module.icon ? (module.icon.startsWith('http') ? 
                    `<img src="${module.icon}" alt="Icon" style="width: 20px; height: 20px; margin-right: 8px;">` : 
                    `<i class="${module.icon}" style="margin-right: 8px;"></i>`) : 
                    '<i class="fas fa-cube" style="margin-right: 8px;"></i>'}
                ${module.name || 'Module không tên'}
            </h4>
            <p>${module.description || 'Không có mô tả'}</p>
            ${module.path ? `<div class="module-path">${module.path}</div>` : ''}
        </div>
    </div>
    <div class="module-actions d-block">
        <button class="btn-edit-module" data-module-id="${module.id}" title="Chỉnh sửa module">
            <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete-module" data-module-id="${module.id}" title="Xóa module">
            <i class="fas fa-trash"></i>
        </button>
    </div>
`;
                modulesList.appendChild(moduleItem);
            });
        } else {
            const emptyModule = document.createElement('li');
            emptyModule.className = 'empty-modules';
            emptyModule.innerHTML = 'Chưa có module nào. Kéo module vào đây hoặc thêm module mới.';
            modulesList.appendChild(emptyModule);
        }
        
        systemElement.appendChild(systemHeader);
        systemElement.appendChild(modulesList);
        container.appendChild(systemElement);
    });



    // Thêm event listeners cho các nút action sau khi tạo xong DOM
    setTimeout(() => {
        // Event listeners cho nút sửa hệ thống
        document.querySelectorAll('.btn-edit-system').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const systemId = this.getAttribute('data-system-id');
                openSystemModal(systemId);
            });
        });
        
        // Event listeners cho nút xóa hệ thống
        document.querySelectorAll('.btn-delete-system').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const systemId = this.getAttribute('data-system-id');
                handleDeleteSystem(systemId);
            });
        });
        
        // Event listeners cho nút sửa module
        document.querySelectorAll('.btn-edit-module').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const moduleId = this.getAttribute('data-module-id');
                openModuleModal(moduleId);
            });
        });
        
        // Event listeners cho nút xóa module
        document.querySelectorAll('.btn-delete-module').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const moduleId = this.getAttribute('data-module-id');
                handleDeleteModule(moduleId);
            });
        });
    }, 100);


}




// Hàm xử lý xóa hệ thống
function handleDeleteSystem(systemId) {
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    
    if (confirmModal && confirmTitle && confirmMessage) {
        confirmTitle.textContent = 'Xác nhận xóa hệ thống';
        confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa hệ thống này? Tất cả module thuộc hệ thống này cũng sẽ bị xóa.';
        
        // Gắn sự kiện cho nút xác nhận
        const confirmYesBtn = document.getElementById('confirm-yes');
        if (confirmYesBtn) {
            confirmYesBtn.onclick = async function() {
                try {
                    showLoading('Đang xóa hệ thống...', 'Vui lòng đợi');
                    
                    const response = await fetch(`/api/systems/${systemId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Lỗi khi xóa hệ thống');
                    }
                    
                    // Đóng modal và tải lại danh sách
                    closeAllModals();
                    
                    // Xóa khỏi localStorage order nếu có
                    const savedOrder = JSON.parse(localStorage.getItem('systemOrder') || '[]');
                    const newOrder = savedOrder.filter(item => item.id !== systemId);
                    localStorage.setItem('systemOrder', JSON.stringify(newOrder));
                    
                    // Xóa module orders của hệ thống này
                    const savedModuleOrders = JSON.parse(localStorage.getItem('moduleOrders') || '{}');
                    delete savedModuleOrders[systemId];
                    localStorage.setItem('moduleOrders', JSON.stringify(savedModuleOrders));
                    
                    await loadSystems();
                    hideLoading();
                    showToast('Đã xóa hệ thống thành công!');
                } catch (error) {
                    console.error('Lỗi khi xóa hệ thống:', error);
                    hideLoading();
                    showToast(error.message, 'error');
                    closeAllModals();
                }
            };
        }
        
        // Gắn sự kiện cho nút hủy
        const confirmNoBtn = document.getElementById('confirm-no');
        if (confirmNoBtn) {
            confirmNoBtn.onclick = function() {
                closeAllModals();
            };
        }
        
        // Hiển thị modal
        confirmModal.style.display = 'block';
    }
}

// Hàm xử lý xóa module
function handleDeleteModule(moduleId) {
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    
    if (confirmModal && confirmTitle && confirmMessage) {
        confirmTitle.textContent = 'Xác nhận xóa module';
        confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa module này?';
        
        // Gắn sự kiện cho nút xác nhận
        const confirmYesBtn = document.getElementById('confirm-yes');
        if (confirmYesBtn) {
            confirmYesBtn.onclick = async function() {
                try {
                    showLoading('Đang xóa module...', 'Vui lòng đợi');
                    
                    const response = await fetch(`/api/modules/${moduleId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Lỗi khi xóa module');
                    }
                    
                    // Đóng modal và tải lại danh sách
                    closeAllModals();
                    
                    // Xóa khỏi localStorage order nếu có
                    const savedOrders = JSON.parse(localStorage.getItem('moduleOrders') || '{}');
                    Object.keys(savedOrders).forEach(systemId => {
                        savedOrders[systemId] = savedOrders[systemId].filter(item => item.id !== moduleId);
                    });
                    localStorage.setItem('moduleOrders', JSON.stringify(savedOrders));
                    
                    await loadSystems();
                    hideLoading();
                    showToast('Đã xóa module thành công!');
                } catch (error) {
                    console.error('Lỗi khi xóa module:', error);
                    hideLoading();
                    showToast(error.message, 'error');
                    closeAllModals();
                }
            };
        }
        
        // Gắn sự kiện cho nút hủy
        const confirmNoBtn = document.getElementById('confirm-no');
        if (confirmNoBtn) {
            confirmNoBtn.onclick = function() {
                closeAllModals();
            };
        }
        
        // Hiển thị modal
        confirmModal.style.display = 'block';
    }
}





function initializeNestedSortable() {
    // Khởi tạo sortable cho container chính (sắp xếp hệ thống)
    const container = document.getElementById('nested-systems-container');
    if (container) {
        new Sortable(container, {
            group: 'systems',
            animation: 150,
            handle: '.system-header .handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: function(evt) {
                updateSystemOrder();
            }
        });
    }
    
    // Khởi tạo sortable cho từng danh sách modules
    const modulesLists = document.querySelectorAll('.modules-list');
    modulesLists.forEach(modulesList => {
        new Sortable(modulesList, {
            group: 'modules',
            animation: 150,
            handle: '.module-info .handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            emptyInsertThreshold: 5,
            onEnd: function(evt) {
                updateModuleOrder(evt);
            }
        });
    });
}


function updateSystemOrder() {
    const container = document.getElementById('nested-systems-container');
    if (!container) return;
    
    const systemItems = container.querySelectorAll('.system-item');
    
    const systemOrder = Array.from(systemItems).map((item, index) => ({
        id: item.getAttribute('data-system-id'),
        order: index + 1
    }));
    
    // Lưu thứ tự vào localStorage như fallback
    localStorage.setItem('systemOrder', JSON.stringify(systemOrder));
    
    // Thử gọi API, nếu thất bại thì dùng localStorage
    fetch('/api/systems/update-order', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ systems: systemOrder }),
    }).then(response => {
        if (response.ok) {
            console.log('Đã cập nhật thứ tự hệ thống qua API');
        } else {
            console.log('API không khả dụng, sử dụng localStorage');
        }
    }).catch(error => {
        console.log('API lỗi, sử dụng localStorage:', error);
        // Không hiển thị toast lỗi nữa vì đã có fallback
    });
}


function updateModuleOrder(evt) {
    const modulesList = evt.to;
    const systemId = modulesList.getAttribute('data-system-id');
    const moduleItems = modulesList.querySelectorAll('.module-item');
    
    const moduleOrder = Array.from(moduleItems).map((item, index) => ({
        id: item.getAttribute('data-module-id'),
        order: index + 1,
        system_id: systemId
    }));
    
    // Lưu thứ tự vào localStorage như fallback
    let allModuleOrders = JSON.parse(localStorage.getItem('moduleOrders') || '{}');
    allModuleOrders[systemId] = moduleOrder;
    localStorage.setItem('moduleOrders', JSON.stringify(allModuleOrders));
    
    // Thử gọi API, nếu thất bại thì dùng localStorage
    fetch('/api/modules/update-order', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modules: moduleOrder }),
    }).then(response => {
        if (response.ok) {
            console.log('Đã cập nhật thứ tự module qua API');
        } else {
            console.log('API không khả dụng, sử dụng localStorage');
        }
    }).catch(error => {
        console.log('API lỗi, sử dụng localStorage:', error);
        // Không hiển thị toast lỗi nữa vì đã có fallback
    });
}


//TODO Hàm tải danh sách module========================================================================
async function loadModules() {
    return loadSystems();
}

//TODO Hàm mở modal thêm/sửa hệ thống========================================================================
function openSystemModal(systemId = null) {
    // THÊM: Kiểm tra element tồn tại trước khi reset
    const systemForm = document.getElementById('system-form');
    if (!systemForm) {
        console.error('Không tìm thấy form system');
        showToast('Không tìm thấy form hệ thống!', 'error');
        return;
    }
    
    // Đặt lại form
    systemForm.reset();
    
    const systemIdInput = document.getElementById('system-id');
    const systemModalTitle = document.getElementById('system-modal-title');
    
    if (systemIdInput) systemIdInput.value = '';
    if (systemModalTitle) systemModalTitle.textContent = 'Thêm hệ thống mới';
    
    if (systemId) {
        // Sửa hệ thống
        if (systemModalTitle) systemModalTitle.textContent = 'Chỉnh sửa hệ thống';
        if (systemIdInput) systemIdInput.value = systemId;
        
        // Lấy thông tin hệ thống từ API
        fetch(`/api/systems/list`)
            .then(response => response.json())
            .then(systems => {
                const system = systems.find(s => s.id === systemId);
                if (system) {
                    const systemName = document.getElementById('system-name');
                    const systemDescription = document.getElementById('system-description');
                    const systemIcon = document.getElementById('system-icon');
                    
                    if (systemName) systemName.value = system.name || '';
                    if (systemDescription) systemDescription.value = system.description || '';
                    if (systemIcon) systemIcon.value = system.icon || '';
                }
            })
            .catch(error => {
                console.error('Lỗi khi lấy thông tin hệ thống:', error);
                showToast('Lỗi khi lấy thông tin hệ thống!', 'error');
            });
    }
    
    // Hiển thị modal
    const systemModal = document.getElementById('system-modal');
    if (systemModal) {
        systemModal.style.display = 'block';
    } else {
        console.error('Không tìm thấy modal system');
        showToast('Không tìm thấy modal hệ thống!', 'error');
    }
}


//TODO Hàm mở modal thêm/sửa module========================================================================
function openModuleModal(moduleId = null) {
    // THÊM: Kiểm tra element tồn tại trước khi reset
    const moduleForm = document.getElementById('module-form');
    if (!moduleForm) {
        console.error('Không tìm thấy form module');
        showToast('Không tìm thấy form module!', 'error');
        return;
    }
    
    // Đặt lại form
    moduleForm.reset();
    
    const moduleIdInput = document.getElementById('module-id');
    const moduleModalTitle = document.getElementById('module-modal-title');
    
    if (moduleIdInput) moduleIdInput.value = '';
    if (moduleModalTitle) moduleModalTitle.textContent = 'Thêm module mới';
    
    // Lấy danh sách hệ thống
    fetch('/api/systems/list')
        .then(response => response.json())
        .then(systems => {
            const systemSelect = document.getElementById('module-system');
            if (systemSelect) {
                systemSelect.innerHTML = '<option value="">-- Chọn hệ thống --</option>';
                
                systems.forEach(system => {
                    const option = document.createElement('option');
                    option.value = system.id;
                    option.textContent = system.name;
                    systemSelect.appendChild(option);
                });
            }
            
            if (moduleId) {
                // Sửa module
                if (moduleModalTitle) moduleModalTitle.textContent = 'Chỉnh sửa module';
                if (moduleIdInput) moduleIdInput.value = moduleId;
                
                // Lấy thông tin module từ API
                fetch(`/api/modules/list`)
                    .then(response => response.json())
                    .then(modules => {
                        const module = modules.find(m => m.id === moduleId);
                        if (module) {
                            const moduleSystem = document.getElementById('module-system');
                            const moduleName = document.getElementById('module-name');
                            const moduleDescription = document.getElementById('module-description');
                            const modulePath = document.getElementById('module-path');
                            const moduleIcon = document.getElementById('module-icon');
                            
                            if (moduleSystem) moduleSystem.value = module.system_id || '';
                            if (moduleName) moduleName.value = module.name || '';
                            if (moduleDescription) moduleDescription.value = module.description || '';
                            if (modulePath) modulePath.value = module.path || '';
                            if (moduleIcon) moduleIcon.value = module.icon || '';
                        }
                    })
                    .catch(error => {
                        console.error('Lỗi khi lấy thông tin module:', error);
                        showToast('Lỗi khi lấy thông tin module!', 'error');
                    });
            }
        })
        .catch(error => {
            console.error('Lỗi khi lấy danh sách hệ thống:', error);
            showToast('Lỗi khi lấy danh sách hệ thống!', 'error');
        });
    
    // Hiển thị modal
    const moduleModal = document.getElementById('module-modal');
    if (moduleModal) {
        moduleModal.style.display = 'block';
    } else {
        console.error('Không tìm thấy modal module');
        showToast('Không tìm thấy modal module!', 'error');
    }
}



//TODO Hàm lưu hệ thống========================================================================
async function saveSystem() {
    try {
        const systemId = document.getElementById('system-id').value;
        const name = document.getElementById('system-name').value;
        const description = document.getElementById('system-description').value || '';
        const icon = document.getElementById('system-icon').value || '';
        
        if (!name) {
            showToast('Vui lòng nhập tên hệ thống!', 'error');
            return;
        }
        
        // Tạo object dữ liệu
        const systemData = {
            name,
            description,
            icon
        };
        
        // Gọi API tương ứng
        let response;
        if (systemId) {
            // Cập nhật hệ thống
            response = await fetch(`/api/systems/${systemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(systemData),
            });
        } else {
            // Thêm hệ thống mới
            response = await fetch('/api/systems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(systemData),
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi lưu hệ thống');
        }
        
        // Đóng modal và tải lại danh sách
        closeAllModals();
        await loadSystems();
        
        showToast(systemId ? 'Đã cập nhật hệ thống thành công!' : 'Đã thêm hệ thống mới thành công!');
    } catch (error) {
        console.error('Lỗi khi lưu hệ thống:', error);
        showToast(error.message, 'error');
    }
}

//TODO Hàm lưu module========================================================================
async function saveModule() {
    try {
        const moduleId = document.getElementById('module-id').value;
        const system_id = document.getElementById('module-system').value;
        const name = document.getElementById('module-name').value;
        const description = document.getElementById('module-description').value || '';
        const path = document.getElementById('module-path').value;
        const icon = document.getElementById('module-icon').value || '';
        
        if (!system_id || !name || !path) {
            showToast('Vui lòng nhập đầy đủ thông tin bắt buộc!', 'error');
            return;
        }
        
        // Tạo object dữ liệu
        const moduleData = {
            system_id,
            name,
            description,
            path,
            icon
        };
        
        // Gọi API tương ứng
        let response;
        if (moduleId) {
            // Cập nhật module
            response = await fetch(`/api/modules/${moduleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(moduleData),
            });
        } else {
            // Thêm module mới
            response = await fetch('/api/modules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(moduleData),
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi lưu module');
        }
        
        // Đóng modal và tải lại danh sách
        closeAllModals();
        await loadModules();
        
        showToast(moduleId ? 'Đã cập nhật module thành công!' : 'Đã thêm module mới thành công!');
    } catch (error) {
        console.error('Lỗi khi lưu module:', error);
        showToast(error.message, 'error');
    }
}

//TODO Hàm cập nhật select filter hệ thống========================================================================
function updateSystemFilter(systems) {
    const systemFilter = document.getElementById('system-filter');
    systemFilter.innerHTML = '<option value="">Tất cả hệ thống</option>';
    
    systems.forEach(system => {
        const option = document.createElement('option');
        option.value = system.id;
        option.textContent = system.name;
        systemFilter.appendChild(option);
    });
}

//TODO Hàm lọc module theo hệ thống========================================================================
function filterModules() {
    loadModules();
}

//todo Hàm tải danh sách module theo hệ thống========================================================================
async function loadSystemModules() {
    try {
      const response = await fetch('/api/systems/list');
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách hệ thống');
      }
      
      const systems = await response.json();
      
      // Lấy modules cho từng hệ thống
      for (const system of systems) {
        const modulesResponse = await fetch(`/api/modules/list?system_id=${system.id}`);
        if (modulesResponse.ok) {
          system.modules = await modulesResponse.json();
        } else {
          system.modules = [];
        }
      }
      
      return systems;
    } catch (error) {
      console.error('Lỗi khi tải thông tin hệ thống và modules:', error);
      showToast('Lỗi khi tải thông tin hệ thống!', 'error');
      return [];
    }
}


//! ====================================================================================================================================

//! =================================================================
//! PHÂN QUYỀN
//  Mô tả: Quản lý phân quyền theo phòng ban và người dùng
//! =================================================================

//TODO Tải trạng thái phân quyền========================================================================
async function loadPermissions() {
    try {
        // Get department list
        const deptResponse = await fetch('/api/departments/list');
        if (!deptResponse.ok) {
            throw new Error('Không thể lấy danh sách phòng ban');
        }
        
        const departments = await deptResponse.json();
        
        // Update selector for department permissions
        const deptSelector = document.getElementById('department-permission-select');
        if (deptSelector) {
            deptSelector.innerHTML = '<option value="">-- Chọn phòng ban --</option>';
            
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.name;
                option.textContent = dept.name;
                deptSelector.appendChild(option);
            });
        }
        
        // Update department permissions table
        await updateDepartmentPermissionsTable();
        
        // Clear permissions table for User tab
        const userPermContainer = document.querySelector('.user-permissions-container');
        if (userPermContainer) {
            userPermContainer.innerHTML = '<p>Vui lòng chọn một phòng ban để hiển thị quyền của người dùng.</p>';
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin phân quyền:', error);
        // No toast here to avoid errors
    }
}

//TODO Cập nhật bảng phân quyền phòng ban========================================================================
async function updateDepartmentPermissionsTable() {
    try {
      const permTable = safeGetElement('department-permissions-table');
      if (!permTable) {
        console.warn('Không tìm thấy bảng phân quyền phòng ban');
        return;
      }
      
      // Hiển thị trạng thái đang tải
      const thead = permTable.querySelector('thead') || permTable.appendChild(document.createElement('thead'));
      const tbody = permTable.querySelector('tbody') || permTable.appendChild(document.createElement('tbody'));
      
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:20px;">Đang tải dữ liệu phân quyền...</td></tr>';
      
      // Lấy danh sách phòng ban
      const deptsResponse = await fetch('/api/departments/list');
      if (!deptsResponse.ok) {
        throw new Error('Không thể lấy danh sách phòng ban');
      }
      const departments = await deptsResponse.json();
      
      // Lấy danh sách hệ thống và module
      const sysResponse = await fetch('/api/systems/list');
      if (!sysResponse.ok) {
        throw new Error('Không thể lấy danh sách hệ thống');
      }
      const systems = await sysResponse.json();
      
      // Với mỗi hệ thống, tải danh sách module
      for (let system of systems) {
        const modulesResponse = await fetch(`/api/modules/list?system_id=${system.id}`);
        if (modulesResponse.ok) {
          system.modules = await modulesResponse.json();
        } else {
          system.modules = [];
        }
      }
      
      // Lấy quyền truy cập - cả quyền hệ thống và quyền module
      const sysPermsResponse = await fetch('/api/users/permissions/department/systems');
      if (!sysPermsResponse.ok) {
        throw new Error('Không thể lấy thông tin phân quyền hệ thống');
      }
      const sysPermsData = await sysPermsResponse.json();
      const systemPermissions = sysPermsData.permissions || [];
      
      // Lấy quyền module
      const modulePermsResponse = await fetch('/api/users/permissions/department/modules/all');
      if (!modulePermsResponse.ok) {
        throw new Error('Không thể lấy thông tin phân quyền module');
      }
      const modulePermissions = await modulePermsResponse.json();
      
      // Tạo hàng tiêu đề
      thead.innerHTML = '';
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = '<th rowspan="2">Phòng ban</th>';
      
      const subHeaderRow = document.createElement('tr');
      
      // Thêm tiêu đề hệ thống và module
      systems.forEach(system => {
        headerRow.innerHTML += `<th colspan="${system.modules.length || 1}">${system.name}</th>`;
        
        if (system.modules && system.modules.length > 0) {
          // Thêm tiêu đề cho từng module
          system.modules.forEach(module => {
            const moduleHeader = document.createElement('th');
            moduleHeader.textContent = module.name;
            subHeaderRow.appendChild(moduleHeader);
          });
        } else {
          // Nếu không có module, thêm tiêu đề "Toàn bộ"
          const sysHeader = document.createElement('th');
          sysHeader.textContent = "Toàn bộ";
          subHeaderRow.appendChild(sysHeader);
        }
      });
      
      thead.appendChild(headerRow);
      thead.appendChild(subHeaderRow);
      
      // Tạo hàng cho từng phòng ban
      tbody.innerHTML = '';
      
      departments.forEach(dept => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${dept.name}</td>`;
        
        // Thêm ô cho module của mỗi hệ thống
        systems.forEach(system => {
          if (system.modules && system.modules.length > 0) {
            // Thêm checkbox cho từng module
            system.modules.forEach(module => {
              // Tìm quyền tương ứng từ danh sách quyền module
              const modulePermission = modulePermissions.find(p => 
                p.department === dept.name && p.module_id === module.id
              );
              
              const checked = modulePermission && modulePermission.can_access === 1 ? 'checked' : '';
              
              row.innerHTML += `
                <td style="text-align: center;">
                  <input type="checkbox" data-dept="${dept.name}" 
                    data-module="${module.id}" data-system="${system.id}" ${checked}>
                </td>
              `;
            });
          } else {
            // Thêm checkbox cho toàn bộ hệ thống
            const systemPermission = systemPermissions.find(p => 
              p.department === dept.name && p.system_id === system.id
            );
            
            const checked = systemPermission && systemPermission.can_access === 1 ? 'checked' : '';
            
            row.innerHTML += `
              <td style="text-align: center;">
                <input type="checkbox" data-dept="${dept.name}" 
                  data-system="${system.id}" ${checked}>
              </td>
            `;
          }
        });
        
        tbody.appendChild(row);
      });
      
      // Thêm sự kiện cho các checkbox
      permTable.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
          const department = this.getAttribute('data-dept');
          const systemId = this.getAttribute('data-system');
          const moduleId = this.getAttribute('data-module');
          const canAccess = this.checked ? 1 : 0;
          
          try {
            let url, data;
            
            if (moduleId) {
              // Cập nhật quyền module
              url = '/api/users/permissions/department/modules';
              data = { department, moduleId, canAccess };
            } else {
              // Cập nhật quyền hệ thống
              url = '/api/users/permissions/department/systems';
              data = { department, systemId, canAccess };
            }
            
            const response = await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Lỗi khi cập nhật quyền');
            }
            
            // Nếu là quyền hệ thống được cập nhật, tải lại bảng quyền để cập nhật trạng thái của các module
            if (!moduleId) {
              // Đợi một chút để server xử lý
              setTimeout(() => {
                updateDepartmentPermissionsTable();
              }, 500);
            }
            
            showToast('Đã cập nhật quyền thành công');
          } catch (error) {
            console.error('Lỗi khi cập nhật quyền:', error);
            showToast(`Lỗi khi cập nhật quyền: ${error.message}`, 'error');
            
            // Khôi phục trạng thái checkbox
            this.checked = !this.checked;
          }
        });
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật bảng phân quyền phòng ban:', error);
      
      const permTable = safeGetElement('department-permissions-table');
      if (permTable && permTable.querySelector('tbody')) {
        permTable.querySelector('tbody').innerHTML = 
          `<tr><td colspan="10" style="text-align:center;color:red;padding:20px;">
             Lỗi: ${error.message}
           </td></tr>`;
      }
    }
  }
  
  //TODO Hàm lưu phân quyền phòng ban========================================================================
  async function saveDepartmentPermissions() {
    try {
      // Lấy tất cả các checkbox trong bảng phân quyền
      const checkboxes = document.querySelectorAll('#department-permissions-table input[type="checkbox"]');
      
      // Lưu lại trạng thái hiện tại của tất cả các checkbox để hiển thị lại nếu có lỗi
      const checkboxStates = Array.from(checkboxes).map(cb => {
        return {
          dept: cb.getAttribute('data-dept'),
          system: cb.getAttribute('data-system'),
          module: cb.getAttribute('data-module'),
          checked: cb.checked
        };
      });
      
      // Hiển thị thông báo đang xử lý
      showToast('Đang lưu phân quyền...', 'info');
      
      // Tạo mảng các promise để xử lý đồng thời
      const promises = [];
      
      checkboxes.forEach(checkbox => {
        const department = checkbox.getAttribute('data-dept');
        const systemId = checkbox.getAttribute('data-system');
        const moduleId = checkbox.getAttribute('data-module');
        const canAccess = checkbox.checked ? 1 : 0;
        
        // Tạo request cập nhật quyền tương ứng
        let url, data;
        
        if (moduleId) {
          // Cập nhật quyền module
          url = '/api/users/permissions/department/modules';
          data = { department, moduleId, canAccess };
          
          console.log(`Lưu quyền module cho phòng ban ${department}:`, {
            module_id: moduleId,
            can_access: canAccess
          });
        } else {
          // Cập nhật quyền hệ thống
          url = '/api/users/permissions/department/systems';
          data = { department, systemId, canAccess };
          
          console.log(`Lưu quyền hệ thống cho phòng ban ${department}:`, {
            system_id: systemId,
            can_access: canAccess
          });
        }
        
        const promise = fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        promises.push(promise);
      });
      
      // Chờ tất cả các request hoàn thành
      const results = await Promise.allSettled(promises);
      
      // Kiểm tra xem có lỗi không
      const errors = results.filter(result => result.status === 'rejected');
      
      if (errors.length > 0) {
        console.error('Có lỗi khi lưu phân quyền:', errors);
        showToast(`Có ${errors.length} lỗi khi lưu phân quyền!`, 'error');
      } else {
        showToast('Đã lưu phân quyền phòng ban thành công!');
        
        // Tải lại bảng phân quyền để hiển thị dữ liệu mới nhất
        setTimeout(() => {
          updateDepartmentPermissionsTable();
        }, 500);
      }
    } catch (error) {
      console.error('Lỗi khi lưu phân quyền phòng ban:', error);
      showToast('Lỗi khi lưu phân quyền phòng ban!', 'error');
    }
  }


  //todo Hàm để load quyền của phòng ban và hiển thị lên giao diện==================================================
async function loadDepartmentModulePermissions() {
    try {
      // Lấy tất cả quyền phòng ban
      const response = await fetch('/api/users/permissions/department/modules');
      if (!response.ok) {
        throw new Error('Không thể lấy quyền phòng ban');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Lỗi không xác định');
      }
      
      console.log('Dữ liệu quyền phòng ban:', data.permissions);
      
      // Xóa tất cả trạng thái checkbox hiện tại
      document.querySelectorAll('.dept-module-permission').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Cập nhật trạng thái checkbox dựa trên dữ liệu từ server
      data.permissions.forEach(permission => {
        if (permission && permission.department && permission.module_id) {
          const checkboxId = `dept-${permission.department.replace(/\s+/g, '-')}-module-${permission.module_id}`;
          const checkbox = document.getElementById(checkboxId);
          
          if (checkbox) {
            checkbox.checked = permission.can_access === 1;
            console.log(`Cập nhật checkbox ${checkboxId}: ${permission.can_access === 1}`);
          } else {
            console.log(`Không tìm thấy checkbox ${checkboxId}`);
          }
        }
      });
    } catch (error) {
      console.error('Lỗi khi load quyền phòng ban:', error);
      alert('Có lỗi khi tải quyền phòng ban: ' + error.message);
    }
}

//todo Hàm tải danh sách phòng ban cho phân quyền=================================================================
async function loadDepartmentsForPermissions() {
    try {
      const departmentSelect = document.getElementById('department-select');
      if (!departmentSelect) {
        console.error('Không tìm thấy element department-select');
        return;
      }
      
      // Xóa hết các option trước
      departmentSelect.innerHTML = '<option value="">-- Chọn phòng ban --</option>';
      
      // Lấy danh sách phòng ban
      const response = await fetch('/api/departments/list');
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách phòng ban');
      }
      
      const departments = await response.json();
      console.log('Danh sách phòng ban:', departments);
      
      // Để đảm bảo không trùng lặp
      const addedDeptNames = new Set();
      
      // Thêm option cho mỗi phòng ban
      departments.forEach(dept => {
        // Kiểm tra tên phòng ban đã thêm chưa
        if (addedDeptNames.has(dept.name)) {
          console.log(`Bỏ qua phòng ban trùng lặp: ${dept.name}`);
          return;
        }
        
        // Thêm tên vào Set để đánh dấu đã thêm
        addedDeptNames.add(dept.name);
        
        // Tạo option mới
        const option = document.createElement('option');
        option.value = dept.name;
        option.textContent = dept.name;
        departmentSelect.appendChild(option);
      });
      
      // Thêm event listener khi thay đổi phòng ban
      if (departmentSelect.options.length > 1 && !departmentSelect._hasChangeListener) {
        departmentSelect.addEventListener('change', function() {
          const selectedDept = this.value;
          if (selectedDept) {
            loadDepartmentPermissions(selectedDept);
          } else {
            clearPermissionsDisplay();
          }
        });
        departmentSelect._hasChangeListener = true;
      }
      
      console.log(`Đã tải ${departments.length} phòng ban, hiển thị ${addedDeptNames.size} phòng ban sau khi lọc`);
      
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng ban:', error);
      alert('Có lỗi khi tải danh sách phòng ban: ' + error.message);
    }
}

//TODO Lưu phân quyền theo người dùng========================================================================
async function saveUserPermissions() {
    try {
        const userId = document.getElementById('user-permission-select').value;
        if (!userId) {
            showToast('Vui lòng chọn người dùng!', 'error');
            return;
        }
        
        // Lấy thông tin nhà máy của người dùng
        const userOption = document.querySelector(`#user-permission-select option[value="${userId}"]`);
        const nhaMay = userOption ? userOption.getAttribute('data-nha-may') : '';
        
        if (!nhaMay) {
            showToast('Không xác định được nhà máy của người dùng!', 'error');
            return;
        }
        
        // Lấy quyền từ form một cách chính xác hơn
        const permissions = [
            {
                pageName: 'phieu-sang-cuon',
                canAccess: document.querySelector('input[name="phieu-sang-cuon-access"]').checked ? 1 : 0,
                canEdit: document.querySelector('input[name="phieu-sang-cuon-edit"]').checked ? 1 : 0,
                canDelete: document.querySelector('input[name="phieu-sang-cuon-delete"]').checked ? 1 : 0,
                nhaMay: nhaMay
            },
            {
                pageName: 'phieu-cat',
                canAccess: document.querySelector('input[name="phieu-cat-access"]').checked ? 1 : 0,
                canEdit: document.querySelector('input[name="phieu-cat-edit"]').checked ? 1 : 0,
                canDelete: document.querySelector('input[name="phieu-cat-delete"]').checked ? 1 : 0,
                nhaMay: nhaMay
            }
        ];
        
        // Xử lý từng quyền riêng biệt
        for (const perm of permissions) {
            await fetch(`/api/users/permissions/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(perm),
            });
        }
        
        showToast('Đã lưu phân quyền người dùng thành công!');
    } catch (error) {
        console.error('Lỗi khi lưu phân quyền người dùng:', error);
        showToast('Lỗi khi lưu phân quyền người dùng!', 'error');
    }
}

//todo Hàm xử lý khi chọn phòng ban trong phân quyền người dùng=====================================================
async function updateUserPermissionsTable(department) {
    if (!department) {
        document.querySelector('.user-permissions-container').style.display = 'none';
        document.querySelector('.permissions-legend').style.display = 'none';
        return;
    }

    try {
        const userPermissionsContainer = document.querySelector('.user-permissions-container');
        userPermissionsContainer.innerHTML = '<div style="text-align:center;padding:20px;">Đang tải dữ liệu quyền người dùng...</div>';
        userPermissionsContainer.style.display = 'block';
        document.querySelector('.permissions-legend').style.display = 'block';

        // 1. Lấy tất cả người dùng thuộc phòng ban - Sửa URL API để chắc chắn mã hóa đúng
        const usersResponse = await fetch(`/api/users/list?department=${encodeURIComponent(department)}`);
        
        if (!usersResponse.ok) {
            console.error('Lỗi response khi lấy danh sách người dùng:', await usersResponse.text());
            throw new Error('Không thể lấy danh sách người dùng của phòng ban');
        }
        
        const users = await usersResponse.json();
        console.log('Danh sách người dùng thuộc phòng ban:', users);

        // 2. Lấy hệ thống và module mà phòng ban có quyền
        const deptSystemResponse = await fetch(`/api/users/permissions/department/all-modules?department=${encodeURIComponent(department)}`);
        if (!deptSystemResponse.ok) {
            throw new Error('Không thể lấy quyền hệ thống của phòng ban');
        }
        const deptSystemData = await deptSystemResponse.json();

        if (!deptSystemData.success || !deptSystemData.systems || deptSystemData.systems.length === 0) {
            userPermissionsContainer.innerHTML = `<div style="text-align:center;padding:20px;">
                Phòng ban <strong>${department}</strong> chưa được cấp quyền truy cập vào bất kỳ hệ thống/module nào.
                <br>Vui lòng thiết lập quyền trong tab "Phân quyền theo phòng ban" trước.
            </div>`;
            return;
        }

        // 3. Tạo bảng hiển thị
        const table = document.createElement('table');
        table.id = 'user-permissions-table';
        table.className = 'table table-bordered';
        
        // 4. Tạo header
        const thead = document.createElement('thead');
        
        // Tạo header chỉ hiển thị tên module một lần
const headerRow = document.createElement('tr');
headerRow.innerHTML = `<th rowspan="2" style="min-width: 150px;">Người dùng</th>`;
        
        // Tạo hàng header phụ với tên module và 3 cột con (view, edit, delete)
        const subHeaderRow = document.createElement('tr');
        
        // Đếm tổng số cột (để set colspan cho loading và empty message)
        let totalColumns = 1; // Bắt đầu từ 1 cho cột người dùng
        
        // Thêm header cho từng hệ thống và module
deptSystemData.systems.forEach(system => {
    // Chỉ lấy những module mà phòng ban có quyền truy cập
    const accessibleModules = system.modules.filter(module => module.can_access === 1);
    
    if (accessibleModules.length > 0) {
        // Thêm header hệ thống với colspan bằng số module
        headerRow.innerHTML += `<th colspan="${accessibleModules.length}" style="background-color: #e9f7fe;">${system.system_name}</th>`;
        
        // Thêm header cho từng module vào hàng subheader
        accessibleModules.forEach(module => {
            subHeaderRow.innerHTML += `
                <th style="background-color: #f5f5f5;">${module.name}</th>
            `;
        });
    }
});

        
        thead.appendChild(headerRow);
        thead.appendChild(subHeaderRow);
        table.appendChild(thead);
        
        // 5. Tạo phần thân bảng
        const tbody = document.createElement('tbody');
        
        // Nếu không có người dùng nào trong phòng ban
        if (!users || users.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="${totalColumns}" style="text-align:center;padding:15px;">
                Không có người dùng nào thuộc phòng ban ${department}
            </td>`;
            tbody.appendChild(emptyRow);
        } else {
            // Lọc bỏ tài khoản admin
            const filteredUsers = users.filter(user => user.role !== 'admin');
            
            // Nếu sau khi lọc không còn người dùng nào
            if (filteredUsers.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="${totalColumns}" style="text-align:center;padding:15px;">
                    Phòng ban ${department} chỉ có tài khoản admin. Tài khoản admin không cần phân quyền.
                </td>`;
                tbody.appendChild(emptyRow);
            } else {
                // Thêm hàng cho từng người dùng
                for (const user of filteredUsers) {
                    const row = document.createElement('tr');
                    
                    // Cột thông tin người dùng
                    row.innerHTML = `
                        <td style="text-align:left; border: 1px solid #dee2e6;">
                            <div><strong>${user.employee_id || ''}</strong></div>
                            <div>${user.fullname || ''}</div>
                            <div class="nhaMay-badge ${user.nhaMay === 'Nhà máy 3' ? 'nhaMay-3' : 'nhaMay-1-2'}">${user.nhaMay}</div>
                        </td>
                    `;
                    
                    // Lấy quyền hiện tại của người dùng
                    try {
                        const userPermissionsResponse = await fetch(`/api/users/permissions/user/modules?userId=${user.id}&nhaMay=${encodeURIComponent(user.nhaMay || '')}`);
                        const userPermissions = userPermissionsResponse.ok ? await userPermissionsResponse.json() : [];
                
                        // Duyệt qua các hệ thống và module
                        deptSystemData.systems.forEach(system => {
                            // Chỉ lấy những module mà phòng ban có quyền truy cập
                            const accessibleModules = system.modules.filter(module => module.can_access === 1);
                            
                            accessibleModules.forEach(module => {
                                // Tìm quyền tương ứng của người dùng cho module này
                                const modulePermission = userPermissions.find(p => p.module_id === module.id);
                                
                                // Thiết lập các biến trạng thái quyền - Mặc định có quyền truy cập
                                const canAccess = modulePermission ? modulePermission.can_access === 1 : true;
                                const canEdit = modulePermission ? modulePermission.can_edit === 1 : false;
                                const canDelete = modulePermission ? modulePermission.can_delete === 1 : false;
                                
                                // Tạo các icon quyền trong cùng 1 ô
                                row.innerHTML += `
                                    <td style="border: 1px solid #dee2e6;">
                                        <div style="display: flex; justify-content: space-around; align-items: center;">
                                            <i class="fas fa-eye ${canAccess ? 'text-success' : 'text-muted'}" 
                                               data-user="${user.id}" 
                                               data-module="${module.id}" 
                                               data-permission="access"
                                               data-nha-may="${user.nhaMay || ''}"
                                               style="cursor:pointer; margin: 0 3px;"></i>
                                            <i class="fas fa-pen ${canEdit ? 'text-success' : 'text-muted'}" 
                                               data-user="${user.id}" 
                                               data-module="${module.id}" 
                                               data-permission="edit"
                                               data-nha-may="${user.nhaMay || ''}"
                                               style="cursor:pointer; margin: 0 3px;"></i>
                                            <i class="fas fa-trash ${canDelete ? 'text-success' : 'text-muted'}" 
                                               data-user="${user.id}" 
                                               data-module="${module.id}" 
                                               data-permission="delete"
                                               data-nha-may="${user.nhaMay || ''}"
                                               style="cursor:pointer; margin: 0 3px;"></i>
                                        </div>
                                    </td>
                                `;
                            });
                        });
                    } catch (error) {
                        console.error(`Lỗi khi lấy quyền người dùng ${user.id}:`, error);
                        // Nếu có lỗi khi lấy quyền, vẫn hiển thị các icon nhưng không có quyền
                        deptSystemData.systems.forEach(system => {
                            const accessibleModules = system.modules.filter(module => module.can_access === 1);
                            
                            accessibleModules.forEach(module => {
                                row.innerHTML += `
                                    <td>
                                        <i class="fas fa-eye text-muted" 
                                           data-user="${user.id}" 
                                           data-module="${module.id}" 
                                           data-permission="access"
                                           data-nha-may="${user.nhaMay || ''}"
                                           style="cursor:pointer;"></i>
                                    </td>
                                    <td>
                                        <i class="fas fa-pen text-muted" 
                                           data-user="${user.id}" 
                                           data-module="${module.id}" 
                                           data-permission="edit"
                                           data-nha-may="${user.nhaMay || ''}"
                                           style="cursor:pointer;"></i>
                                    </td>
                                    <td>
                                        <i class="fas fa-trash text-muted" 
                                           data-user="${user.id}" 
                                           data-module="${module.id}" 
                                           data-permission="delete"
                                           data-nha-may="${user.nhaMay || ''}"
                                           style="cursor:pointer;"></i>
                                    </td>
                                `;
                            });
                        });
                    }
                    
                    tbody.appendChild(row);
                }
            }
        }
        
        table.appendChild(tbody);
        userPermissionsContainer.innerHTML = '';
        userPermissionsContainer.appendChild(table);
        
        // 6. Thêm sự kiện click cho các icon
        const icons = table.querySelectorAll('.fas');
        icons.forEach(icon => {
            icon.addEventListener('click', toggleUserPermission);
        });
        
    } catch (error) {
        console.error('Lỗi khi tạo bảng phân quyền người dùng:', error);
        const userPermissionsContainer = document.querySelector('.user-permissions-container');
        userPermissionsContainer.innerHTML = `<div style="text-align:center;color:red;padding:20px;">
            Lỗi: ${error.message}
        </div>`;
    }
}

//TODO Hàm xử lý khi click vào biểu tượng phân quyền========================================================================
async function toggleUserPermission(event) {
    try {
        const icon = event.target;
        const userId = icon.getAttribute('data-user');
        const moduleId = icon.getAttribute('data-module');
        const permissionType = icon.getAttribute('data-permission');
        const nhaMay = icon.getAttribute('data-nha-may');
        
        if (!userId || !moduleId || !permissionType || !nhaMay) {
            console.error('Thiếu thông tin cần thiết:', { userId, moduleId, permissionType, nhaMay });
            showToast('Thiếu thông tin cần thiết để cập nhật quyền', 'error');
            return;
        }
        
        // Lấy trạng thái hiện tại
        const isActive = icon.classList.contains('text-success');
        
        // Đặt lại trạng thái biểu tượng và chuẩn bị dữ liệu gửi lên server
        let data = {
            userId,
            moduleId,
            nhaMay,
            canAccess: 1, // Mặc định luôn có quyền truy cập
            canEdit: 0,
            canDelete: 0
        };
        
        // Cập nhật UI và dữ liệu cho các loại quyền
        if (permissionType === 'access') {
            // Nếu đang tắt quyền truy cập
            if (isActive) {
                icon.classList.remove('text-success');
                icon.classList.add('text-muted');
                data.canAccess = 0;
                
                // Tắt tất cả các quyền khác
                const editIcon = icon.closest('td').querySelector('.fa-pen');
                const deleteIcon = icon.closest('td').querySelector('.fa-trash');
                
                if (editIcon) {
                    editIcon.classList.remove('text-success');
                    editIcon.classList.add('text-muted');
                }
                
                if (deleteIcon) {
                    deleteIcon.classList.remove('text-success');
                    deleteIcon.classList.add('text-muted');
                }
            } else {
                icon.classList.remove('text-muted');
                icon.classList.add('text-success');
                data.canAccess = 1;
            }
        } else if (permissionType === 'edit') {
            const accessIcon = icon.closest('td').querySelector('.fa-eye');
            
            if (isActive) {
                icon.classList.remove('text-success');
                icon.classList.add('text-muted');
                data.canEdit = 0;
                
                // Tắt quyền xóa nếu có
                const deleteIcon = icon.closest('td').querySelector('.fa-trash');
                if (deleteIcon && deleteIcon.classList.contains('text-success')) {
                    deleteIcon.classList.remove('text-success');
                    deleteIcon.classList.add('text-muted');
                }
            } else {
                icon.classList.remove('text-muted');
                icon.classList.add('text-success');
                data.canEdit = 1;
                
                // Bật quyền truy cập nếu chưa có
                if (accessIcon && accessIcon.classList.contains('text-muted')) {
                    accessIcon.classList.remove('text-muted');
                    accessIcon.classList.add('text-success');
                }
            }
            
            // Cập nhật trạng thái quyền truy cập
            data.canAccess = accessIcon && accessIcon.classList.contains('text-success') ? 1 : 0;
            
            // Cập nhật trạng thái quyền xóa
            const deleteIcon = icon.closest('td').querySelector('.fa-trash');
            data.canDelete = deleteIcon && deleteIcon.classList.contains('text-success') ? 1 : 0;
            
        } else if (permissionType === 'delete') {
            const accessIcon = icon.closest('td').querySelector('.fa-eye');
            const editIcon = icon.closest('td').querySelector('.fa-pen');
            
            if (isActive) {
                icon.classList.remove('text-success');
                icon.classList.add('text-muted');
                data.canDelete = 0;
            } else {
                icon.classList.remove('text-muted');
                icon.classList.add('text-success');
                data.canDelete = 1;
                
                // Bật quyền truy cập và chỉnh sửa
                if (accessIcon && accessIcon.classList.contains('text-muted')) {
                    accessIcon.classList.remove('text-muted');
                    accessIcon.classList.add('text-success');
                }
                
                if (editIcon && editIcon.classList.contains('text-muted')) {
                    editIcon.classList.remove('text-muted');
                    editIcon.classList.add('text-success');
                }
            }
            
            // Cập nhật trạng thái quyền truy cập và chỉnh sửa
            data.canAccess = accessIcon && accessIcon.classList.contains('text-success') ? 1 : 0;
            data.canEdit = editIcon && editIcon.classList.contains('text-success') ? 1 : 0;
        }
        
        console.log("Đang gửi dữ liệu cập nhật quyền:", data);
        
        // Gửi dữ liệu lên server
        const response = await fetch(`/api/users/permissions/user/modules`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi cập nhật quyền');
        }
        
        // Hiển thị thông báo thành công nhỏ ở góc
        showToast(`Đã cập nhật quyền ${permissionType === 'access' ? 'truy cập' : permissionType === 'edit' ? 'chỉnh sửa' : 'xóa'} thành công!`);
        
    } catch (error) {
        console.error('Lỗi khi cập nhật quyền:', error);
        showToast('Lỗi khi cập nhật quyền: ' + error.message, 'error');
        
        // Khôi phục trạng thái trước đó của icon
        const icon = event.target;
        if (icon.classList.contains('text-success')) {
            icon.classList.remove('text-success');
            icon.classList.add('text-muted');
        } else {
            icon.classList.remove('text-muted');
            icon.classList.add('text-success');
        }
    }
}

//todo Cập nhật selector phân quyền người dùng========================================================================
function updateUserPermissionSelector(users) {
    const userSelector = document.getElementById('user-permission-select');
    userSelector.innerHTML = '<option value="">-- Chọn người dùng --</option>';
    
    users.filter(user => user.role !== 'admin').forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.fullname || user.employee_id} (${user.nhaMay || ''}, ${user.department || 'Chưa có phòng ban'})`;
        option.setAttribute('data-nha-may', user.nhaMay || '');
        userSelector.appendChild(option);
    });
}

//todo Lấy danh sách người dùng theo phòng ban========================================================================
document.getElementById('department-permission-select').addEventListener('change', function() {
    const department = this.value;
    if (!department) {
      document.getElementById('user-permission-select').innerHTML = '<option value="">-- Chọn người dùng --</option>';
      document.querySelector('.user-permissions-container').style.display = 'none';
      return;
    }
    
    // Lấy danh sách người dùng của phòng ban
    fetch(`/api/users/list?department=${encodeURIComponent(department)}`)
      .then(response => response.json())
      .then(users => {
        const userSelector = document.getElementById('user-permission-select');
        userSelector.innerHTML = '<option value="">-- Chọn người dùng --</option>';
        
        users.filter(user => user.role !== 'admin').forEach(user => {
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = `${user.fullname || user.employee_id} (${user.nhaMay || ''})`;
          option.setAttribute('data-nha-may', user.nhaMay || '');
          userSelector.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        showToast('Lỗi khi lấy danh sách người dùng!', 'error');
      });
});

//todo Tải quyền của người dùng========================================================================
async function loadUserPermissions(userId) {
    try {
        // Lấy thông tin nhà máy của người dùng
        const userOption = document.querySelector(`#user-permission-select option[value="${userId}"]`);
        const nhaMay = userOption ? userOption.getAttribute('data-nha-may') : '';
        
        // Truyền thông tin nhà máy vào API
        const response = await fetch(`/api/users/permissions/${userId}?nhaMay=${encodeURIComponent(nhaMay)}`);
        if (!response.ok) {
            throw new Error('Không thể lấy quyền người dùng');
        }
        
        const permissions = await response.json();
        
        // Reset form
        document.querySelectorAll('#user-permissions-table input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Cập nhật các checkbox theo quyền người dùng
        permissions.forEach(perm => {
            const accessCheckbox = document.querySelector(`input[name="${perm.page_name}-access"]`);
            const editCheckbox = document.querySelector(`input[name="${perm.page_name}-edit"]`);
            const deleteCheckbox = document.querySelector(`input[name="${perm.page_name}-delete"]`);
            
            if (accessCheckbox) accessCheckbox.checked = perm.can_access === 1;
            if (editCheckbox) editCheckbox.checked = perm.can_edit === 1;
            if (deleteCheckbox) deleteCheckbox.checked = perm.can_delete === 1;
        });
        
    } catch (error) {
        console.error('Lỗi khi tải quyền người dùng:', error);
        showToast('Lỗi khi tải quyền người dùng!', 'error');
    }
}

//todo Lưu phân quyền theo phòng ban========================================================================
async function saveDepartmentPermissions() {
    try {
      // Lấy tất cả các checkbox trong bảng phân quyền
      const checkboxes = document.querySelectorAll('#department-permissions-table input[type="checkbox"]');
      
      // Tạo mảng các promise để xử lý đồng thời
      const promises = [];
      
      checkboxes.forEach(checkbox => {
        const department = checkbox.getAttribute('data-dept');
        const systemId = checkbox.getAttribute('data-system');
        const canAccess = checkbox.checked ? 1 : 0;
        
        // Tạo request cập nhật quyền
        const promise = fetch('/api/users/permissions/department/systems', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            department,
            systemId,
            canAccess
          }),
        });
        
        promises.push(promise);
      });
      
      // Chờ tất cả các request hoàn thành
      await Promise.all(promises);
      
      showToast('Đã lưu phân quyền phòng ban thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu phân quyền phòng ban:', error);
      showToast('Lỗi khi lưu phân quyền phòng ban!', 'error');
    }
}

//todo Thêm sự kiện cho selector phòng ban trong phân quyền người dùng=======================================
document.getElementById('department-permission-select').addEventListener('change', function() {
    const department = this.value;
    updateUserPermissionsTable(department);
});




//! ====================================================================================================================================

//! =================================================================
//! MASTER DATA - KHÁCH HÀNG
//  Mô tả: Quản lý danh mục khách hàng, nhập từ Excel, xử lý dữ liệu
//! =================================================================


//TODO Tải danh sách khách hàng========================================================================
async function loadCustomers() {
    try {
      const customersTable = safeGetElement('customers-list');
      
      if (!customersTable) {
        console.warn('Element #customers-list not found');
        return;
      }
      
      customersTable.innerHTML = '<tr><td colspan="4" class="text-center">Đang tải danh sách khách hàng...</td></tr>';
      
      const response = await fetch('/api/customers/list');
      
      if (!response.ok) {
        customersTable.innerHTML = '<tr><td colspan="4" class="text-center" style="color: red;">Không thể lấy danh sách khách hàng</td></tr>';
        return;
      }
      
      const customers = await response.json();
      
      // Hiển thị danh sách khách hàng
      displayCustomersList(customers);
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách hàng:', error);
      const customersTable = safeGetElement('customers-list');
      if (customersTable) {
        customersTable.innerHTML = `<tr><td colspan="4" class="text-center" style="color: red;">Lỗi: ${error.message}</td></tr>`;
      }
    }
}  

//TODO Hiển thị danh sách khách hàng========================================================================
function displayCustomersList(customers) {
    const customersList = safeGetElement('customers-list');
    
    if (!customersList) {
      console.warn('Element #customers-list not found');
      return;
    }
    
    customersList.innerHTML = '';
    
    if (!customers || customers.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="4" class="text-center">Không có dữ liệu khách hàng</td>';
      customersList.appendChild(emptyRow);
      return;
    }
    
    customers.forEach(customer => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${customer.code || ''}</td>
        <td>${customer.name || ''}</td>
        <td>${customer.alias || ''}</td>
        <td class="actions">
          <button class="btn-edit" onclick="editCustomer('${customer.id}')" title="Chỉnh sửa">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-delete" onclick="deleteCustomer('${customer.id}')" title="Xóa">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      customersList.appendChild(row);
    });
}







//TODO Xử lý file Excel========================================================================
function handleExcelFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            
            // Cấu hình đọc file với hỗ trợ UTF-8
            const workbook = XLSX.read(data, {
                type: 'array',
                cellDates: true,
                cellNF: false,
                cellText: false,
                codepage: 65001 // UTF-8
            });
            
            // Lấy sheet đầu tiên
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Chuyển đổi sheet sang JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                raw: false,
                dateNF: 'yyyy-mm-dd',
                defval: ''
            });
            
            // Xử lý dữ liệu
            const customers = [];
            
            // Bỏ qua hàng đầu tiên nếu chứa tiêu đề
            const startRow = (jsonData.length > 0 && 
                (String(jsonData[0][0] || '').toLowerCase().includes('mã') || 
                 String(jsonData[0][1] || '').toLowerCase().includes('tên'))) ? 1 : 0;
            
            for (let i = startRow; i < jsonData.length; i++) {
                const row = jsonData[i];
                
                // Kiểm tra row có phải là array và có dữ liệu không
                if (Array.isArray(row) && row.length > 0) {
                    // Đảm bảo có đủ 3 cột
                    const customer = {
                        code: String(row[0] || '').trim(),
                        name: String(row[1] || '').trim(),
                        alias: row.length > 2 ? String(row[2] || '').trim() : ''
                    };
                    
                    // Chỉ thêm các dòng có ít nhất mã hoặc tên
                    if (customer.code || customer.name) {
                        customers.push(customer);
                    }
                }
            }
            
            if (customers.length === 0) {
                showToast('Không tìm thấy dữ liệu khách hàng trong file!', 'error');
                return;
            }
            
            // Hiển thị modal preview
            displayCustomerPreview(customers);
            
            // Reset giá trị input file để có thể chọn lại cùng một file
            document.getElementById('excel-file-input').value = '';
            
        } catch (error) {
            console.error('Lỗi khi xử lý file Excel:', error);
            showToast('Lỗi khi xử lý file Excel! ' + error.message, 'error');
        }
    };
    
    reader.onerror = function(event) {
        console.error("Lỗi đọc file:", event.target.error);
        showToast('Lỗi khi đọc file!', 'error');
    };
    
    reader.readAsArrayBuffer(file);
}


// Hiển thị modal preview khách hàng
function displayCustomerPreview(customers) {
    const previewList = document.getElementById('preview-list');
    if (!previewList) return;
    
    previewList.innerHTML = '';
    
    if (customers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="3" class="text-center">Không có dữ liệu</td>';
        previewList.appendChild(emptyRow);
    } else {
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.code || ''}</td>
                <td>${customer.name || ''}</td>
                <td>${customer.alias || ''}</td>
            `;
            previewList.appendChild(row);
        });
    }
    
    // Hiển thị modal preview
    const modal = document.getElementById('customer-preview-modal');
    if (modal) {
        modal.style.display = 'block';
    }
    
    // Lưu dữ liệu vào biến tạm thời
    window.tempCustomersData = customers;
}


//todo Thêm một dòng trống vào bảng nhập liệu khách hàng========================================================================
function addEmptyRow(tbody) {
    const row = document.createElement('tr');
    
    for (let i = 0; i < 3; i++) {
        const td = document.createElement('td');
        td.style.padding = '5px';
        td.style.borderBottom = '1px solid #ddd';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.style.width = '100%';
        input.style.padding = '5px';
        input.style.border = '1px solid #ddd';
        input.style.borderRadius = '4px';
        
        td.appendChild(input);
        row.appendChild(td);
    }
    
    // Thêm nút xóa
    const actionTd = document.createElement('td');
    actionTd.style.padding = '5px';
    actionTd.style.borderBottom = '1px solid #ddd';
    actionTd.style.textAlign = 'center';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.className = 'btn-delete';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.color = '#e74c3c';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.title = 'Xóa dòng';
    
    deleteBtn.addEventListener('click', function() {
        const tbody = document.getElementById('paste-table-body');
        if (tbody.children.length > 1) {
            row.remove();
        } else {
            // Nếu chỉ còn 1 dòng, xóa nội dung thay vì xóa dòng
            const inputs = row.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
        }
    });
    
    actionTd.appendChild(deleteBtn);
    row.appendChild(actionTd);
    
    tbody.appendChild(row);
}
//todo Hiển thị xem trước dữ liệu khách hàng từ bảng nhập liệu========================================================================
function previewCustomersFromTable() {
    try {
        const tbody = document.getElementById('paste-table-body');
        const rows = tbody.querySelectorAll('tr');
        
        const customers = [];
        
        // Lấy dữ liệu từ mỗi dòng
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            
            // Kiểm tra nếu có ít nhất một ô không trống
            const hasData = Array.from(inputs).some(input => input.value.trim() !== '');
            
            if (hasData && inputs.length >= 2) {
                customers.push({
                    code: inputs[0].value.trim(),
                    name: inputs[1].value.trim(),
                    alias: inputs.length > 2 ? inputs[2].value.trim() : ''
                });
            }
        });
        
        // Cập nhật bảng xem trước
        const previewList = document.getElementById('preview-list');
        previewList.innerHTML = '';
        
        if (customers.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="3" class="text-center">Không có dữ liệu</td>';
            previewList.appendChild(emptyRow);
        } else {
            customers.forEach(customer => {
                if (!customer.code && !customer.name) return; // Bỏ qua dòng trống
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.code || ''}</td>
                    <td>${customer.name || ''}</td>
                    <td>${customer.alias || ''}</td>
                `;
                previewList.appendChild(row);
            });
        }
        
        // Lưu dữ liệu vào biến tạm thời
        window.tempCustomersData = customers;
        
        // Log dữ liệu để debug
        console.log("Dữ liệu xem trước:", customers);
        
        return customers;
    } catch (error) {
        console.error('Lỗi khi tạo bảng xem trước:', error);
        showToast('Lỗi khi tạo bảng xem trước!', 'error');
        return [];
    }
}

//TODO Lưu dữ liệu khách hàng========================================================================
async function saveCustomersData() {
    try {
        // Lấy dữ liệu từ bảng nhập liệu
        previewCustomersFromTable();
        
        if (!window.tempCustomersData || window.tempCustomersData.length === 0) {
            showToast('Không có dữ liệu để lưu!', 'error');
            return;
        }
        
        // Kiểm tra trùng mã khách hàng
        const codes = window.tempCustomersData.map(customer => customer.code).filter(code => code);
        const duplicateCodes = codes.filter((code, index) => codes.indexOf(code) !== index);
        
        if (duplicateCodes.length > 0) {
            showToast(`Có mã khách hàng bị trùng: ${duplicateCodes.join(', ')}!`, 'error');
            return;
        }
        
        // Hiển thị thông báo đang xử lý
        showToast('Đang xử lý dữ liệu...', 'success');
        
        try {
            const response = await fetch('/api/customers/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Yêu cầu server trả về JSON
                },
                body: JSON.stringify({
                    customers: window.tempCustomersData
                })
            });
            
            // Kiểm tra kiểu dữ liệu trả về 
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.indexOf('application/json') === -1) {
                throw new Error('Server trả về dữ liệu không phải JSON. Vui lòng kiểm tra kết nối server.');
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response error:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || 'Lỗi khi lưu dữ liệu khách hàng');
                } catch (jsonError) {
                    if (errorText.includes('<!DOCTYPE html>')) {
                        throw new Error('Server trả về HTML thay vì JSON. Có thể server gặp lỗi 500.');
                    } else {
                        throw new Error('Lỗi khi lưu dữ liệu: ' + errorText.substring(0, 100));
                    }
                }
            }
            
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                const responseText = await response.text();
                console.log('Raw response:', responseText);
                throw new Error('Không thể xử lý phản hồi từ server');
            }
            
            // Xóa dữ liệu tạm và ẩn bảng xem trước
            window.tempCustomersData = null;
            document.querySelector('.preview-table-container').style.display = 'none';
            document.getElementById('paste-table-body').innerHTML = '';
            addEmptyRow(document.getElementById('paste-table-body'));
            
            // Tải lại danh sách khách hàng
            loadCustomers();
            
            // Chuyển đến tab danh sách khách hàng
            document.querySelector('.tab[data-customer-tab="list-customer"]').click();
            
            showToast(result.message || 'Đã lưu danh mục khách hàng thành công!');
        } catch (fetchError) {
            // Kiểm tra xem lỗi có phải từ mạng không
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
                console.error('Network error:', fetchError);
                showToast('Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng.', 'error');
            } else {
                console.error('Error during fetch:', fetchError);
                showToast(fetchError.message || 'Lỗi khi gửi dữ liệu đến server', 'error');
            }
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu khách hàng:', error);
        showToast(error.message || 'Lỗi khi lưu dữ liệu khách hàng!', 'error');
    }
}

//todo Hủy nhập dữ liệu khách hàng========================================================================
function cancelImport() {
    window.tempCustomersData = null;
    document.querySelector('.preview-table-container').style.display = 'none';
    document.getElementById('paste-table-body').innerHTML = '';
    addEmptyRow(document.getElementById('paste-table-body'));
}



//? Chỉnh sửa khách hàng========================================================================
window.editCustomer = async function(customerId) {
    try {
        const response = await fetch(`/api/customers/list`);
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin khách hàng');
        }
        
        const customers = await response.json();
        const customer = customers.find(c => c.id === customerId);
        
        if (!customer) {
            showToast('Không tìm thấy thông tin khách hàng!', 'error');
            return;
        }
        
        // Hiển thị modal chỉnh sửa (sử dụng modal xác nhận)
        const confirmModal = document.getElementById('confirm-modal');
        const confirmTitle = document.getElementById('confirm-title');
        const confirmMessage = document.getElementById('confirm-message');
        
        confirmTitle.textContent = 'Chỉnh sửa khách hàng';
        confirmMessage.innerHTML = `
            <div class="form-group">
                <label for="edit-customer-code">Mã khách <span class="required">*</span></label>
                <input type="text" id="edit-customer-code" value="${customer.code}" required>
            </div>
            <div class="form-group">
                <label for="edit-customer-name">Tên khách hàng <span class="required">*</span></label>
                <input type="text" id="edit-customer-name" value="${customer.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-customer-alias">Tên khác</label>
                <input type="text" id="edit-customer-alias" value="${customer.alias || ''}">
            </div>
        `;
        
        // Thay đổi nút xác nhận
        const confirmYesBtn = document.getElementById('confirm-yes');
        const confirmNoBtn = document.getElementById('confirm-no');
        
        confirmYesBtn.textContent = 'Lưu';
        confirmNoBtn.textContent = 'Hủy';
        
        // Gán sự kiện cho nút lưu
        confirmYesBtn.onclick = async function() {
            const code = document.getElementById('edit-customer-code').value;
            const name = document.getElementById('edit-customer-name').value;
            const alias = document.getElementById('edit-customer-alias').value;
            
            if (!code || !name) {
                showToast('Vui lòng nhập đầy đủ thông tin bắt buộc!', 'error');
                return;
            }
            
            try {
                const response = await fetch(`/api/customers/${customerId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code,
                        name,
                        alias
                    })
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Lỗi khi cập nhật khách hàng');
                }
                
                closeAllModals();
                loadCustomers();
                showToast('Đã cập nhật khách hàng thành công!');
            } catch (error) {
                console.error('Lỗi khi cập nhật khách hàng:', error);
                showToast(error.message || 'Lỗi khi cập nhật khách hàng!', 'error');
            }
        };
        
        // Gán sự kiện cho nút hủy
        confirmNoBtn.onclick = function() {
            closeAllModals();
        };
        
        // Hiển thị modal
        confirmModal.style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi lấy thông tin khách hàng:', error);
        showToast('Lỗi khi lấy thông tin khách hàng!', 'error');
    }
};

//? Xóa khách hàng========================================================================
window.deleteCustomer = function(customerId) {
    // Hiển thị modal xác nhận
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    
    confirmTitle.textContent = 'Xác nhận xóa';
    confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa khách hàng này?';
    
    // Gán sự kiện cho nút xác nhận
    document.getElementById('confirm-yes').onclick = async function() {
        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Lỗi khi xóa khách hàng');
            }
            
            closeAllModals();
            loadCustomers();
            showToast('Đã xóa khách hàng thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa khách hàng:', error);
            showToast(error.message || 'Lỗi khi xóa khách hàng!', 'error');
            closeAllModals();
        }
    };
    
    // Gán sự kiện cho nút hủy
    document.getElementById('confirm-no').onclick = function() {
        closeAllModals();
    };
    
    // Hiển thị modal
    confirmModal.style.display = 'block';
};












//! ====================================================================================================================================

//! =================================================================
//! MASTER DATA - ĐỊNH MỨC
//  Mô tả: Quản lý danh mục ĐỊNH MỨC, nhập từ Excel, xử lý dữ liệu
//! =================================================================
// Sự kiện cho tab Master Data
document.querySelectorAll('.tab[data-master-tab]').forEach(tab => {
    tab.addEventListener('click', function() {
        // Loại bỏ active từ tất cả các tab master
        document.querySelectorAll('.tab[data-master-tab]').forEach(t => {
            t.classList.remove('active');
        });
        
        // Add active cho tab hiện tại
        this.classList.add('active');
        
        // Hiển thị nội dung tab tương ứng
        const tabContentId = this.getAttribute('data-master-tab') + '-content';
        document.querySelectorAll('.master-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(tabContentId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});

// Sự kiện cho tab định mức
document.querySelectorAll('.tab[data-dinh-muc-tab]').forEach(tab => {
    tab.addEventListener('click', function() {
        // Loại bỏ active từ tất cả các tab
        document.querySelectorAll('.tab[data-dinh-muc-tab]').forEach(t => {
            t.classList.remove('active');
        });
        
        // Add active cho tab hiện tại
        this.classList.add('active');
        
        // Hiển thị nội dung tab tương ứng
        const tabContentId = this.getAttribute('data-dinh-muc-tab') + '-content';
        document.querySelectorAll('.dinh-muc-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const tabContent = document.getElementById(tabContentId);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

// Sự kiện cho nút nhập Excel định mức
const importDinhMucExcelBtn = document.getElementById('import-dinh-muc-excel-btn');
if (importDinhMucExcelBtn) {
    importDinhMucExcelBtn.addEventListener('click', function() {
        const fileInput = document.getElementById('dinh-muc-excel-input');
        if (fileInput) {
            fileInput.click();
        }
    });
}

// Xử lý file Excel định mức khi người dùng chọn file
const dinhMucExcelInput = document.getElementById('dinh-muc-excel-input');
if (dinhMucExcelInput) {
    dinhMucExcelInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleDinhMucExcelFile(e.target.files[0]);
        }
    });
}

// Hàm xử lý file Excel định mức
function handleDinhMucExcelFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            
            // Cấu hình đọc file với hỗ trợ UTF-8
            const workbook = XLSX.read(data, {
                type: 'array',
                cellDates: true,
                cellNF: false,
                cellText: false,
                codepage: 65001 // UTF-8
            });
            
            // Lấy sheet đầu tiên
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Chuyển đổi sheet sang JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                raw: false,
                dateNF: 'yyyy-mm-dd',
                defval: ''
            });
            
            // Xử lý dữ liệu
            const dinhMucList = [];
            
            // Bỏ qua hàng đầu tiên nếu chứa tiêu đề
            const startRow = (jsonData.length > 0 && 
                (String(jsonData[0][0] || '').toLowerCase().includes('mã') || 
                 String(jsonData[0][1] || '').toLowerCase().includes('định lượng'))) ? 1 : 0;
            
            for (let i = startRow; i < jsonData.length; i++) {
                const row = jsonData[i];
                
                // Kiểm tra row có phải là array và có dữ liệu không
                if (Array.isArray(row) && row.length > 0) {
                    // Nếu chỉ có mã giấy GMC 1 hoặc chỉ có mã giấy GMC 2, vẫn xử lý
                    if (!row[0] && !row[8]) continue; // Bỏ qua nếu không có mã giấy nào
                    
                    const dinhMuc = {
                        ma_giay: String(row[0] || '').trim(),
                        dinh_luong: String(row[1] || '').trim(),
                        so_to_pallet_gmc1: String(row[2] || '').trim(),
                        do_day_giay_gmc1: String(row[3] || '').trim(),
                        chieu_cao_pallet_gmc1: String(row[4] || '').trim(),
                        ky_tu_11_gmc1: String(row[5] || '').trim(),
                        // Bỏ qua 2 cột trống (6,7) và lấy dữ liệu GMC 2
                        ma_giay_gmc2: String(row[8] || '').trim(),
                        dinh_luong_gmc2: String(row[9] || '').trim(),
                        so_to_pallet_gmc2: String(row[10] || '').trim(),
                        do_day_giay_gmc2: String(row[11] || '').trim(),
                        chieu_cao_pallet_gmc2: String(row[12] || '').trim(),
                        ky_tu_11_gmc2: String(row[13] || '').trim()
                    };
                    
                    dinhMucList.push(dinhMuc);
                }
            }
            
            if (dinhMucList.length === 0) {
                showToast('Không tìm thấy dữ liệu định mức trong file!', 'error');
                return;
            }
            
            // Hiển thị modal preview
            displayDinhMucPreview(dinhMucList);
            
            // Reset giá trị input file để có thể chọn lại cùng một file
            document.getElementById('dinh-muc-excel-input').value = '';
            
        } catch (error) {
            console.error('Lỗi khi xử lý file Excel:', error);
            showToast('Lỗi khi xử lý file Excel! ' + error.message, 'error');
        }
    };
    
    reader.onerror = function(event) {
        console.error("Lỗi đọc file:", event.target.error);
        showToast('Lỗi khi đọc file!', 'error');
    };
    
    reader.readAsArrayBuffer(file);
}

// Hiển thị modal preview định mức
function displayDinhMucPreview(dinhMucList) {
    const previewList = document.getElementById('dinh-muc-preview-list');
    if (!previewList) return;
    
    previewList.innerHTML = '';
    
    if (dinhMucList.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="12" class="text-center">Không có dữ liệu</td>';
        previewList.appendChild(emptyRow);
    } else {
        dinhMucList.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.ma_giay || ''}</td>
                <td>${item.dinh_luong || ''}</td>
                <td>${item.so_to_pallet_gmc1 || ''}</td>
                <td>${item.do_day_giay_gmc1 || ''}</td>
                <td>${item.chieu_cao_pallet_gmc1 || ''}</td>
                <td>${item.ky_tu_11_gmc1 || ''}</td>
                <td>${item.ma_giay_gmc2 || ''}</td>
                <td>${item.dinh_luong_gmc2 || ''}</td>
                <td>${item.so_to_pallet_gmc2 || ''}</td>
                <td>${item.do_day_giay_gmc2 || ''}</td>
                <td>${item.chieu_cao_pallet_gmc2 || ''}</td>
                <td>${item.ky_tu_11_gmc2 || ''}</td>
            `;
            previewList.appendChild(row);
        });
    }
    
    // Hiển thị modal preview
    const modal = document.getElementById('dinh-muc-preview-modal');
    if (modal) {
        modal.style.display = 'block';
    }
    
    // Lưu dữ liệu vào biến tạm thời
    window.tempDinhMucData = dinhMucList;
}

// Sự kiện lưu dữ liệu định mức
const saveDinhMucBtn = document.getElementById('save-dinh-muc-btn');
if (saveDinhMucBtn) {
    saveDinhMucBtn.addEventListener('click', saveDinhMucData);
}

// Sự kiện hủy nhập định mức
const cancelDinhMucImportBtn = document.getElementById('cancel-dinh-muc-import-btn');
if (cancelDinhMucImportBtn) {
    cancelDinhMucImportBtn.addEventListener('click', cancelDinhMucImport);
}

// Hàm lưu dữ liệu định mức
async function saveDinhMucData() {
    try {
        if (!window.tempDinhMucData || window.tempDinhMucData.length === 0) {
            showToast('Không có dữ liệu để lưu!', 'error');
            return;
        }
        
        // Hiển thị thông báo đang xử lý
        showToast('Đang xử lý dữ liệu...', 'success');
        
        try {
            const response = await fetch('/api/dinh-muc/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    dinhMucList: window.tempDinhMucData
                })
            });
            
            // Kiểm tra kiểu dữ liệu trả về
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.indexOf('application/json') === -1) {
                throw new Error('Server trả về dữ liệu không phải JSON. Vui lòng kiểm tra kết nối server.');
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response error:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || 'Lỗi khi lưu dữ liệu định mức');
                } catch (jsonError) {
                    if (errorText.includes('<!DOCTYPE html>')) {
                        throw new Error('Server trả về HTML thay vì JSON. Có thể server gặp lỗi 500.');
                    } else {
                        throw new Error('Lỗi khi lưu dữ liệu: ' + errorText.substring(0, 100));
                    }
                }
            }
            
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                const responseText = await response.text();
                console.log('Raw response:', responseText);
                throw new Error('Không thể xử lý phản hồi từ server');
            }
            
            // Xóa dữ liệu tạm và ẩn bảng xem trước
            window.tempDinhMucData = null;
            document.getElementById('dinh-muc-preview-container').style.display = 'none';
            
            // Tải lại danh sách định mức
            loadDinhMuc();
            
            // Chuyển đến tab danh sách định mức
            document.querySelector('.tab[data-dinh-muc-tab="list-dinh-muc"]').click();
            
            showToast(result.message || 'Đã lưu danh mục định mức thành công!');
        } catch (fetchError) {
            // Kiểm tra xem lỗi có phải từ mạng không
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
                console.error('Network error:', fetchError);
                showToast('Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng.', 'error');
            } else {
                console.error('Error during fetch:', fetchError);
                showToast(fetchError.message || 'Lỗi khi gửi dữ liệu đến server', 'error');
            }
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu định mức:', error);
        showToast(error.message || 'Lỗi khi lưu dữ liệu định mức!', 'error');
    }
}

// Hủy nhập dữ liệu định mức
function cancelDinhMucImport() {
    window.tempDinhMucData = null;
    document.getElementById('dinh-muc-preview-container').style.display = 'none';
}

// Tải danh sách định mức
async function loadDinhMuc() {
    try {
        const dinhMucList = document.getElementById('dinh-muc-list');
        if (!dinhMucList) {
            console.warn('Element #dinh-muc-list not found');
            return;
        }
        
        dinhMucList.innerHTML = '<tr><td colspan="7" class="text-center">Đang tải danh sách định mức...</td></tr>';
        
        const response = await fetch('/api/dinh-muc/list');
        if (!response.ok) {
            throw new Error('Không thể lấy danh sách định mức');
        }
        
        const dinhMucData = await response.json();
        
        // Hiển thị danh sách định mức
        displayDinhMucList(dinhMucData);
    } catch (error) {
        console.error('Lỗi khi tải danh sách định mức:', error);
        const dinhMucList = document.getElementById('dinh-muc-list');
        if (dinhMucList) {
            dinhMucList.innerHTML = `<tr><td colspan="7" class="text-center" style="color: red;">Lỗi: ${error.message}</td></tr>`;
        }
    }
}

// Hiển thị danh sách định mức
function displayDinhMucList(dinhMucData) {
    const dinhMucList = document.getElementById('dinh-muc-list');
    if (!dinhMucList) return;
    
    dinhMucList.innerHTML = '';
    
    if (!dinhMucData || dinhMucData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="13" class="text-center">Không có dữ liệu định mức</td>';
        dinhMucList.appendChild(emptyRow);
        return;
    }
    
    dinhMucData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.ma_giay || ''}</td>
            <td>${item.dinh_luong || ''}</td>
            <td>${item.so_to_pallet_gmc1 || ''}</td>
            <td>${item.do_day_giay_gmc1 || ''}</td>
            <td>${item.chieu_cao_pallet_gmc1 || ''}</td>
            <td>${item.ky_tu_11_gmc1 || ''}</td>
            <td>${item.ma_giay_gmc2 || ''}</td>
            <td>${item.dinh_luong_gmc2 || ''}</td>
            <td>${item.so_to_pallet_gmc2 || ''}</td>
            <td>${item.do_day_giay_gmc2 || ''}</td>
            <td>${item.chieu_cao_pallet_gmc2 || ''}</td>
            <td>${item.ky_tu_11_gmc2 || ''}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editDinhMuc('${item.id}')" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteDinhMuc('${item.id}')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        dinhMucList.appendChild(row);
    });
}

// Hàm sửa định mức
window.editDinhMuc = async function(id) {
    try {
        const response = await fetch(`/api/dinh-muc/list`);
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin định mức');
        }
        
        const dinhMucList = await response.json();
        const dinhMuc = dinhMucList.find(d => d.id === id);
        
        if (!dinhMuc) {
            showToast('Không tìm thấy thông tin định mức!', 'error');
            return;
        }
        
        // Hiển thị modal chỉnh sửa
        const confirmModal = document.getElementById('confirm-modal');
        const confirmTitle = document.getElementById('confirm-title');
        const confirmMessage = document.getElementById('confirm-message');
        
        confirmTitle.textContent = 'Chỉnh sửa định mức';
        confirmMessage.innerHTML = `
            <div class="form-group">
                <label for="edit-ma-giay">Mã giấy GMC 1 <span class="required">*</span></label>
                <input type="text" id="edit-ma-giay" value="${dinhMuc.ma_giay || ''}" required>
            </div>
            <div class="form-group">
                <label for="edit-dinh-luong">Định lượng GMC 1</label>
                <input type="text" id="edit-dinh-luong" value="${dinhMuc.dinh_luong || ''}">
            </div>
            <div class="form-group">
                <label for="edit-so-to-pallet">Số tờ/pallet GMC 1</label>
                <input type="text" id="edit-so-to-pallet" value="${dinhMuc.so_to_pallet_gmc1 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-do-day-giay">Độ dày giấy GMC 1 (mm)</label>
                <input type="text" id="edit-do-day-giay" value="${dinhMuc.do_day_giay_gmc1 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-chieu-cao-pallet">Chiều cao pallet giấy GMC 1</label>
                <input type="text" id="edit-chieu-cao-pallet" value="${dinhMuc.chieu_cao_pallet_gmc1 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-ky-tu-11">11 kí tự GMC 1</label>
                <input type="text" id="edit-ky-tu-11" value="${dinhMuc.ky_tu_11_gmc1 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-ma-giay-gmc2">Mã giấy GMC 2</label>
                <input type="text" id="edit-ma-giay-gmc2" value="${dinhMuc.ma_giay_gmc2 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-dinh-luong-gmc2">Định lượng GMC 2</label>
                <input type="text" id="edit-dinh-luong-gmc2" value="${dinhMuc.dinh_luong_gmc2 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-so-to-pallet-gmc2">Số tờ/pallet GMC 2</label>
                <input type="text" id="edit-so-to-pallet-gmc2" value="${dinhMuc.so_to_pallet_gmc2 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-do-day-giay-gmc2">Độ dày giấy GMC 2 (mm)</label>
                <input type="text" id="edit-do-day-giay-gmc2" value="${dinhMuc.do_day_giay_gmc2 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-chieu-cao-pallet-gmc2">Chiều cao pallet giấy GMC 2</label>
                <input type="text" id="edit-chieu-cao-pallet-gmc2" value="${dinhMuc.chieu_cao_pallet_gmc2 || ''}">
            </div>
            <div class="form-group">
                <label for="edit-ky-tu-11-gmc2">11 kí tự GMC 2</label>
                <input type="text" id="edit-ky-tu-11-gmc2" value="${dinhMuc.ky_tu_11_gmc2 || ''}">
            </div>
        `;
        
        // Thay đổi nút xác nhận
        const confirmYesBtn = document.getElementById('confirm-yes');
        const confirmNoBtn = document.getElementById('confirm-no');
        
        confirmYesBtn.textContent = 'Lưu';
        confirmNoBtn.textContent = 'Hủy';
        
        // Gán sự kiện cho nút lưu
        confirmYesBtn.onclick = async function() {
            const ma_giay = document.getElementById('edit-ma-giay').value;
            const dinh_luong = document.getElementById('edit-dinh-luong').value;
            const so_to_pallet_gmc1 = document.getElementById('edit-so-to-pallet').value;
            const do_day_giay_gmc1 = document.getElementById('edit-do-day-giay').value;
            const chieu_cao_pallet_gmc1 = document.getElementById('edit-chieu-cao-pallet').value;
            const ky_tu_11_gmc1 = document.getElementById('edit-ky-tu-11').value;
            const ma_giay_gmc2 = document.getElementById('edit-ma-giay-gmc2').value;
            const dinh_luong_gmc2 = document.getElementById('edit-dinh-luong-gmc2').value;
            const so_to_pallet_gmc2 = document.getElementById('edit-so-to-pallet-gmc2').value;
            const do_day_giay_gmc2 = document.getElementById('edit-do-day-giay-gmc2').value;
            const chieu_cao_pallet_gmc2 = document.getElementById('edit-chieu-cao-pallet-gmc2').value;
            const ky_tu_11_gmc2 = document.getElementById('edit-ky-tu-11-gmc2').value;
            
            if (!ma_giay && !ma_giay_gmc2) {
                showToast('Vui lòng nhập ít nhất một mã giấy!', 'error');
                return;
            }
            
            try {
                const response = await fetch(`/api/dinh-muc/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ma_giay,
                        dinh_luong,
                        so_to_pallet_gmc1,
                        do_day_giay_gmc1,
                        chieu_cao_pallet_gmc1,
                        ky_tu_11_gmc1,
                        ma_giay_gmc2,
                        dinh_luong_gmc2,
                        so_to_pallet_gmc2,
                        do_day_giay_gmc2,
                        chieu_cao_pallet_gmc2,
                        ky_tu_11_gmc2
                    })
                });
                
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Lỗi khi cập nhật định mức');
                }
                
                closeAllModals();
                loadDinhMuc();
                showToast('Đã cập nhật định mức thành công!');
            } catch (error) {
                console.error('Lỗi khi cập nhật định mức:', error);
                showToast(error.message || 'Lỗi khi cập nhật định mức!', 'error');
            }
        };
        
        // Gán sự kiện cho nút hủy
        confirmNoBtn.onclick = function() {
            closeAllModals();
        };
        
        // Hiển thị modal
        confirmModal.style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi lấy thông tin định mức:', error);
        showToast('Lỗi khi lấy thông tin định mức!', 'error');
    }
};

// Hàm xóa định mức
window.deleteDinhMuc = function(id) {
    // Hiển thị modal xác nhận
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    
    confirmTitle.textContent = 'Xác nhận xóa';
    confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa định mức này?';
    
    // Gán sự kiện cho nút xác nhận
    document.getElementById('confirm-yes').onclick = async function() {
        try {
            const response = await fetch(`/api/dinh-muc/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Lỗi khi xóa định mức');
            }
            
            closeAllModals();
            loadDinhMuc();
            showToast('Đã xóa định mức thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa định mức:', error);
            showToast(error.message || 'Lỗi khi xóa định mức!', 'error');
            closeAllModals();
        }
    };
    
    // Gán sự kiện cho nút hủy
    document.getElementById('confirm-no').onclick = function() {
        closeAllModals();
    };
    
    // Hiển thị modal
    confirmModal.style.display = 'block';
};

// Load định mức khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    // Load danh sách định mức
    loadDinhMuc();
});


// Thêm sự kiện cho nút đóng modal
document.getElementById('close-customer-preview').addEventListener('click', function() {
    document.getElementById('customer-preview-modal').style.display = 'none';
    window.tempCustomersData = null;
});

document.getElementById('close-dinh-muc-preview').addEventListener('click', function() {
    document.getElementById('dinh-muc-preview-modal').style.display = 'none';
    window.tempDinhMucData = null;
});

// Đóng modal khi nhấn ra ngoài
window.addEventListener('click', function(event) {
    const customerModal = document.getElementById('customer-preview-modal');
    const dinhMucModal = document.getElementById('dinh-muc-preview-modal');
    
    if (event.target === customerModal) {
        customerModal.style.display = 'none';
        window.tempCustomersData = null;
    }
    
    if (event.target === dinhMucModal) {
        dinhMucModal.style.display = 'none';
        window.tempDinhMucData = null;
    }
});

// Sự kiện hủy import khách hàng
document.getElementById('cancel-import-btn').addEventListener('click', function() {
    document.getElementById('customer-preview-modal').style.display = 'none';
    window.tempCustomersData = null;
});

// Sự kiện hủy import định mức
document.getElementById('cancel-dinh-muc-import-btn').addEventListener('click', function() {
    document.getElementById('dinh-muc-preview-modal').style.display = 'none';
    window.tempDinhMucData = null;
});

// Sự kiện lưu khách hàng
document.getElementById('save-customers-btn').addEventListener('click', saveCustomersData);

// Sự kiện lưu định mức
document.getElementById('save-dinh-muc-btn').addEventListener('click', saveDinhMucData);











//! ====================================================================================================================================

//! =================================================================
//! MASTER DATA CHUNG
//  Mô tả: Quản lý cài đặt hệ thống và master data chung
//! =================================================================

//TODO Lưu cài đặt Master Data (Đổi từ System Settings)========================================================================
function saveMasterDataSettings() {
    try {
        // Lấy dữ liệu từ form
        const enforcePasswordComplexity = document.getElementById('enforce-password-complexity')?.checked;
        const autoLogout = document.getElementById('auto-logout')?.checked;
        const logoutTime = document.getElementById('logout-time')?.value;
        
        // Lưu vào localStorage
        if (enforcePasswordComplexity !== undefined) localStorage.setItem('enforcePasswordComplexity', enforcePasswordComplexity.toString());
        if (autoLogout !== undefined) localStorage.setItem('autoLogout', autoLogout.toString());
        if (logoutTime) localStorage.setItem('logoutTime', logoutTime);
        
        showToast('Đã lưu cài đặt master data thành công!');
    } catch (error) {
        console.error('Lỗi khi lưu cài đặt master data:', error);
        showToast('Lỗi khi lưu cài đặt master data!', 'error');
    }
}

//TODO Khôi phục cài đặt mặc định========================================================================
function resetMasterDataSettings() {
    // Các giá trị mặc định
    const enforcePasswordComplexity = document.getElementById('enforce-password-complexity');
    const autoLogout = document.getElementById('auto-logout');
    const logoutTime = document.getElementById('logout-time');
    
    if (enforcePasswordComplexity) enforcePasswordComplexity.checked = true;
    if (autoLogout) autoLogout.checked = false;
    if (logoutTime) {
        logoutTime.value = '30';
        logoutTime.disabled = true;
    }
    
    // Lưu các giá trị mặc định
    saveMasterDataSettings();
    
    showToast('Đã khôi phục cài đặt mặc định!');
}







//! ====================================================================================================================================

//! =================================================================
//! DASHBOARD & SYSTEM INFO
//  Mô tả: Hiển thị thông tin tổng quan và hệ thống
//! =================================================================

//TODO Tải thông tin hệ thống========================================================================
function loadSystemInfo() {
    // Lấy thông tin ngày cài đặt từ localStorage hoặc thiết lập mặc định
    let installDate = localStorage.getItem('installDate');
    if (!installDate) {
        installDate = new Date().toISOString();
        localStorage.setItem('installDate', installDate);
    }
    
    // Định dạng ngày
    const date = new Date(installDate);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    
    document.getElementById('install-date').textContent = formattedDate;
    
    // Tải thông tin phiếu từ API
    loadPhieuCount();
    
    // Tính thời gian hoạt động
    const uptimeStart = localStorage.getItem('uptimeStart') || Date.now().toString();
    localStorage.setItem('uptimeStart', uptimeStart);
    
    const uptimeInDays = Math.floor((Date.now() - parseInt(uptimeStart)) / (1000 * 60 * 60 * 24));
    document.getElementById('uptime-info').textContent = `${uptimeInDays} ngày`;
}

//TODO Tải số lượng phiếu========================================================================
async function loadPhieuCount() {
    try {
        // Lấy danh sách phiếu sang cuộn
        const scResponse = await fetch('/api/sang-cuon/list');
        if (!scResponse.ok) {
            throw new Error('Không thể lấy danh sách phiếu sang cuộn');
        }
        
        const scData = await scResponse.json();
        document.getElementById('sc-count').textContent = scData.length;
        
        // Lấy danh sách phiếu cắt
        const catResponse = await fetch('/api/cat/list');
        if (!catResponse.ok) {
            throw new Error('Không thể lấy danh sách phiếu cắt');
        }
        
        const catData = await catResponse.json();
        document.getElementById('cat-count').textContent = catData.length;
        
    } catch (error) {
        console.error('Lỗi khi tải thông tin phiếu:', error);
    }
}

//TODO Hàm tải lại tất cả dữ liệu========================================================================
function refreshAllData() {
    loadUsers();
    loadDepartments();
    loadSystems();
    loadModules();
    loadCustomers();
    loadPermissions();
    
    showToast('Đã tải lại dữ liệu thành công!');
}






//! ====================================================================================================================================

//! =================================================================
//! KHỞI TẠO 
//  Mô tả: 
//! =================================================================

// Tiện ích: Mở rộng jQuery :contains selector
document.querySelectorAll = document.querySelectorAll || {};
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// Tìm phần tử theo nội dung
function getElementsByContainingText(selector, text) {
    const elements = document.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function(element) {
        return element.textContent.trim() === text.trim();
    });
}

// Mở rộng prototype cho querySelector
if (!document.querySelector.prototype) {
    document.querySelector.prototype = {};
}

if (!document.querySelector.prototype.contains) {
    document.querySelector.prototype.contains = function(selector, text) {
        return getElementsByContainingText(selector, text)[0];
    };
}

// Chỉnh sửa người dùng (Hàm global cho sự kiện onclick)
window.editUser = function(userId) {
    openUserModal(userId);
};

// Xóa người dùng (Hàm global cho sự kiện onclick)
window.deleteUser = function(userId) {
    deleteUser(userId);
};

// Đặt lại mật khẩu (Hàm global cho sự kiện onclick)
window.resetUserPassword = function(userId) {
    resetUserPassword(userId);
};

// Chỉnh sửa phòng ban (Hàm global cho sự kiện onclick)
window.openDepartmentModal = function(departmentName) {
    openDepartmentModal(departmentName);
};

// Khắc phục nút thêm module
window.openModuleModal = function(moduleId = null) {
    // Đặt lại form
    document.getElementById('module-form').reset();
    document.getElementById('module-id').value = '';
    
    document.getElementById('module-modal-title').textContent = 'Thêm module mới';
    
    // Lấy danh sách hệ thống
    fetch('/api/systems/list')
        .then(response => response.json())
        .then(systems => {
            const systemSelect = document.getElementById('module-system');
            systemSelect.innerHTML = '<option value="">-- Chọn hệ thống --</option>';
            
            systems.forEach(system => {
                const option = document.createElement('option');
                option.value = system.id;
                option.textContent = system.name;
                systemSelect.appendChild(option);
            });
            
            if (moduleId) {
                // Sửa module
                document.getElementById('module-modal-title').textContent = 'Chỉnh sửa module';
                document.getElementById('module-id').value = moduleId;
                
                // Lấy thông tin module từ API
                fetch(`/api/modules/list`)
                    .then(response => response.json())
                    .then(modules => {
                        const module = modules.find(m => m.id === moduleId);
                        if (module) {
                            document.getElementById('module-system').value = module.system_id || '';
                            document.getElementById('module-name').value = module.name || '';
                            document.getElementById('module-description').value = module.description || '';
                            document.getElementById('module-path').value = module.path || '';
                            document.getElementById('module-icon').value = module.icon || '';
                        }
                    })
                    .catch(error => {
                        console.error('Lỗi khi lấy thông tin module:', error);
                        showToast('Lỗi khi lấy thông tin module!', 'error');
                    });
            }
        })
        .catch(error => {
            console.error('Lỗi khi lấy danh sách hệ thống:', error);
            showToast('Lỗi khi lấy danh sách hệ thống!', 'error');
        });
    
    // Hiển thị modal
    document.getElementById('module-modal').style.display = 'block';
};


// Khắc phục nút thêm hệ thống
window.openSystemModal = function(systemId = null) {
    // Đặt lại form
    document.getElementById('system-form').reset();
    document.getElementById('system-id').value = '';
    
    document.getElementById('system-modal-title').textContent = 'Thêm hệ thống mới';
    
    if (systemId) {
        // Sửa hệ thống
        document.getElementById('system-modal-title').textContent = 'Chỉnh sửa hệ thống';
        document.getElementById('system-id').value = systemId;
        
        // Lấy thông tin hệ thống từ API
        fetch(`/api/systems/list`)
            .then(response => response.json())
            .then(systems => {
                const system = systems.find(s => s.id === systemId);
                if (system) {
                    document.getElementById('system-name').value = system.name || '';
                    document.getElementById('system-description').value = system.description || '';
                    document.getElementById('system-icon').value = system.icon || '';
                }
            })
            .catch(error => {
                console.error('Lỗi khi lấy thông tin hệ thống:', error);
                showToast('Lỗi khi lấy thông tin hệ thống!', 'error');
            });
    }
    
    // Hiển thị modal
    document.getElementById('system-modal').style.display = 'block';
};


// Thêm sự kiện cho tab hệ thống phần mềm
document.querySelectorAll('.tab[data-system-tab]').forEach(tab => {
    tab.removeEventListener('click', handleSystemTabClick);
});


// Xóa sự kiện cũ cho system filter
const systemFilter = document.getElementById('system-filter');
if (systemFilter) {
    systemFilter.removeEventListener('change', filterModules);
}


// Sự kiện mở modal thêm hệ thống
document.getElementById('add-system-btn').addEventListener('click', function() {
    openSystemModal();
});

// Sự kiện mở modal thêm module
document.getElementById('add-module-btn').addEventListener('click', function() {
    openModuleModal();
});

// Sự kiện lọc module theo hệ thống
document.getElementById('system-filter').addEventListener('change', function() {
    filterModules();
});

// Sự kiện submit form hệ thống
document.getElementById('system-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveSystem();
});

// Sự kiện submit form module
document.getElementById('module-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveModule();
});






function resetSystemForm() {
    const form = document.getElementById('system-form');
    if (form) form.reset();
    document.getElementById('system-id').value = '';
}

function resetModuleForm() {
    const form = document.getElementById('module-form');
    if (form) form.reset();
    document.getElementById('module-id').value = '';
}















//! =================================================================
//! ADMIN MACHINE SELECTION & MANAGEMENT
//  Mô tả: Xử lý chọn máy và quản lý máy cho admin
//! =================================================================

// Biến lưu trữ thông tin module hiện tại và máy đã chọn
var currentAdminModule = null;
var selectedAdminMachine = null;

// Đảm bảo biến có thể truy cập được
window.currentAdminModule = currentAdminModule;
window.selectedAdminMachine = selectedAdminMachine;


// Khởi tạo biến trên window object để tránh lỗi initialization
if (typeof window !== 'undefined') {
    window.currentAdminModule = null;
}

//TODO Cập nhật hàm createAdminModuleCard để thêm modal chọn máy========================================================================
function createAdminModuleCard(module) {
    console.log('Module ID:', module.id, 'Name:', module.name);

    const modulesList = document.getElementById('admin-modules-list');
    if (!modulesList) return;

    const card = document.createElement('div');
    card.className = 'module-card';
    card.style.cursor = 'pointer';

    card.innerHTML = `
        <div class="module-icon">
            ${module.icon ? (module.icon.startsWith('http') ? 
`<img src="${module.icon}" alt="Icon" style="width: 100px; height: 100px;">` : 
`<i class="${module.icon}"></i>`) : 
'<i class="fas fa-cube"></i>'}
        </div>
        <div class="module-name">${module.name || 'Module không tên'}</div>
        <div class="module-description" style="font-size: 12px; color: #666; margin-top: 5px;">${module.description || ''}</div>
        <div style="color: #28a745; margin-top: 5px; font-size: 12px;">
            <i class="fas fa-crown"></i> Admin Access
        </div>
        <div style="margin-top: auto; display: flex; gap: 5px; justify-content: center;">
            <button class="btn-manage-machines" onclick="openAdminMachineManagementModal('${module.id}', '${module.system_id}'); event.stopPropagation();" 
                    style="padding: 4px 8px; font-size: 11px; background: #17a2b8; color: white; border: none; border-radius: 3px;">
                <i class="fas fa-cogs"></i> Quản lý máy
            </button>
            ${(module.id === 'innm1' || module.id === 'gmcnm1') ? `
            <button class="btn-manage-production-users" onclick="openProductionUserManagementModal('${module.id}'); event.stopPropagation();" 
                    style="padding: 4px 8px; font-size: 11px; background: #28a745; color: white; border: none; border-radius: 3px;">
                <i class="fas fa-users"></i> Quản lý người dùng
            </button>
            ` : ''}
        </div>
    `;

    card.addEventListener('click', function() {
        if (module.path) {
            // Hiển thị modal chọn máy thay vì mở trực tiếp
            openAdminMachineSelectionModal(module);
        } else {
            showToast(`Module "${module.name}" không có đường dẫn!`, 'error');
        }
    });

    modulesList.appendChild(card);
}
//TODO Mở modal chọn máy cho admin========================================================================
async function openAdminMachineSelectionModal(module) {
    try {
        // Lưu thông tin module hiện tại
        currentAdminModule = module;
        
        // Cập nhật thông tin module trong modal
        const iconElement = document.getElementById('admin-selected-module-icon');
if (module.icon && module.icon.startsWith('http')) {
    iconElement.innerHTML = `<img src="${module.icon}" alt="Icon" style="width: 48px; height: 48px;">`;
} else {
    iconElement.className = module.icon || 'fas fa-cube';
    iconElement.innerHTML = '';
}
        document.getElementById('admin-selected-module-name').textContent = module.name || 'Module không tên';
        document.getElementById('admin-selected-module-description').textContent = module.description || '';
        
        // Cập nhật tiêu đề modal để hiển thị hệ thống
        const systemName = getSystemName(module.system_id);
        document.getElementById('admin-machine-modal-title').textContent = `Chọn máy - ${systemName}`;
        
        // Reset tìm kiếm
        document.getElementById('admin-machine-search').value = '';
        
        // Hiển thị modal
        document.getElementById('admin-machine-modal').style.display = 'block';
        
        // Tải danh sách máy theo system_id
        await loadAdminMachines();
        
    } catch (error) {
        console.error('Lỗi khi mở modal chọn máy:', error);
        showToast('Có lỗi khi tải danh sách máy!', 'error');
    }
}

// Hàm helper để lấy tên hệ thống
function getSystemName(systemId) {
    const systemNames = {
        'sanxuat-nm1': 'Sản xuất NM1',
        'sanxuat-nm2': 'Sản xuất NM2', 
        'sanxuat-nm3': 'Sản xuất NM3'
    };
    return systemNames[systemId] || 'Hệ thống không xác định';
}

//TODO Tải danh sách máy cho admin========================================================================
async function loadAdminMachines(searchTerm = '') {
    try {
        const machinesGrid = document.getElementById('admin-machines-grid');
        const emptyState = document.getElementById('admin-empty-machines');
        
        if (!machinesGrid || !emptyState) {
            console.error('Không tìm thấy elements modal máy');
            return;
        }   
        
        // Hiển thị loading
        machinesGrid.innerHTML = `
            <div class="admin-machines-loading" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 40px; color: #7f8c8d;">
                <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #e0e6ed; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <p>Đang tải danh sách máy...</p>
            </div>
        `;
        emptyState.style.display = 'none';
        
        // Gọi API lấy danh sách máy hoạt động
        const systemId = currentAdminModule ? currentAdminModule.system_id : '';
        const moduleId = currentAdminModule ? currentAdminModule.id : '';
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
                (machine.code || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Hiển thị danh sách máy
        displayAdminMachines(machines);
        
    } catch (error) {
        console.error('Lỗi khi tải danh sách máy:', error);
        
        // Hiển thị lỗi
        const machinesGrid = document.getElementById('admin-machines-grid');
        if (machinesGrid) {
            machinesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <h3>Không thể tải danh sách máy</h3>
                    <p>${error.message}</p>
                    <button class="btn-primary" onclick="loadAdminMachines()" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
        }
    }
}


//TODO Hiển thị danh sách máy cho admin========================================================================
function displayAdminMachines(machines) {
    const machinesGrid = document.getElementById('admin-machines-grid');
    const emptyState = document.getElementById('admin-empty-machines');
    
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
        card.className = 'admin-machine-card';
        if (selectedAdminMachine && selectedAdminMachine.id === machine.id) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <div class="machine-header">
    <div>
        <h3 class="machine-name">${machine.name || 'Không tên'}</h3>
        <div class="machine-location">${machine.location || 'Chưa có vị trí'}</div>
    </div>
                <span class="machine-status ${machine.status || 'active'}">${machine.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</span>
            </div>
            <div class="machine-description">${machine.description || 'Không có mô tả'}</div>
            <div class="machine-actions">
                <button class="btn-action btn-edit" onclick="editAdminMachine('${machine.id}'); event.stopPropagation();" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteAdminMachine('${machine.id}'); event.stopPropagation();" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Thêm sự kiện click để chọn máy
        card.addEventListener('click', function() {
            selectAdminMachine(machine);
        });
        
        machinesGrid.appendChild(card);
    });
}

//TODO Chọn máy và vào module========================================================================
function selectAdminMachine(machine) {
    if (!currentAdminModule) {
        showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        return;
    }
    
    // Lưu máy đã chọn vào localStorage
    localStorage.setItem('selectedMachine', JSON.stringify(machine));
    
    // Đóng modal
    document.getElementById('admin-machine-modal').style.display = 'none';
    
    // Hiển thị thông báo
    showToast(`Đã chọn máy "${machine.name}". Đang chuyển đến ${currentAdminModule.name}...`);
    
    // Mở module trong tab mới với thông tin máy
    setTimeout(() => {
        const moduleUrl = `${currentAdminModule.path}?machine=${encodeURIComponent(machine.id)}&machineName=${encodeURIComponent(machine.name)}`;
        window.open(moduleUrl, '_blank');
    }, 1000);
}

//TODO Mở modal quản lý máy========================================================================
async function openAdminMachineManagementModal(moduleId = null, systemId = null) {
    try {
        // Lưu thông tin module và system hiện tại để dùng khi thêm máy
        if (moduleId && systemId) {
            const moduleData = { id: moduleId, system_id: systemId };
            currentAdminModule = moduleData;
            window.currentAdminModule = moduleData;
        } else if (window.currentAdminModule) {
            // Sử dụng dữ liệu từ window nếu có
            currentAdminModule = window.currentAdminModule;
        }
        
        // Hiển thị modal quản lý
        const modal = document.getElementById('admin-manage-machines-modal');
        if (!modal) {
            console.error('Không tìm thấy modal quản lý máy');
            throw new Error('Không tìm thấy modal quản lý máy');
        }
        
        modal.style.display = 'block';
        
        // Reset tìm kiếm
        const searchInput = document.getElementById('admin-manage-machine-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Tải danh sách máy để quản lý
        await loadAdminMachinesForManagement('', moduleId);
        
    } catch (error) {
        console.error('Lỗi khi mở modal quản lý máy:', error);
        if (typeof showToast === 'function') {
            showToast('Có lỗi khi tải giao diện quản lý máy!', 'error');
        } else {
            alert('Có lỗi khi tải giao diện quản lý máy: ' + error.message);
        }
    }
}

//TODO Tải danh sách máy để quản lý========================================================================
async function loadAdminMachinesForManagement(searchTerm = '', moduleId = null) {
    try {
        const machinesList = document.getElementById('admin-machines-management-list');
        
        // Hiển thị loading
        machinesList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <div class="spinner" style="width: 30px; height: 30px; border: 3px solid #e0e6ed; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                    Đang tải danh sách máy...
                </td>
            </tr>
        `;
        
        // Gọi API lấy máy - lọc theo module nếu có
        let url = '/api/machines/list';
        if (moduleId) {
            url += `?module_id=${moduleId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Không thể lấy danh sách máy');
        }
        
        let machines = await response.json();

// Sắp xếp máy theo thứ tự tăng dần (tên máy)
machines.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
});
        
        // Lọc theo tìm kiếm nếu có
        if (searchTerm) {
            machines = machines.filter(machine => 
                (machine.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (machine.location || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Hiển thị danh sách máy trong bảng
        displayAdminMachinesForManagement(machines);
        
    } catch (error) {
        console.error('Lỗi khi tải danh sách máy để quản lý:', error);
        
        document.getElementById('admin-machines-management-list').innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i><br>
                    Không thể tải danh sách máy: ${error.message}
                    <br><br>
                    <button class="btn-primary" onclick="loadAdminMachinesForManagement('', '${moduleId || ''}')" style="margin-top: 10px;">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </td>
            </tr>
        `;
    }
}

//TODO Hiển thị danh sách máy trong bảng quản lý========================================================================
function displayAdminMachinesForManagement(machines) {
    const machinesList = document.getElementById('admin-machines-management-list');
    
    if (!machines || machines.length === 0) {
        machinesList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-industry" style="font-size: 32px; margin-bottom: 10px;"></i><br>
                    Không có máy nào được tìm thấy
                    <br><br>
                    <button class="btn-primary" onclick="openAdminMachineForm()" style="margin-top: 10px;">
                        <i class="fas fa-plus"></i> Thêm máy đầu tiên
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    machinesList.innerHTML = '';
    
    machines.forEach(machine => {
        const row = document.createElement('tr');
        
        // Format ngày tạo
        let formattedDate = '';
        if (machine.created_at) {
            try {
                const date = new Date(machine.created_at);
                formattedDate = date.toLocaleDateString('vi-VN');
            } catch (e) {
                formattedDate = 'N/A';
            }
        }
        
        row.innerHTML = `
            <td>
                <div style="font-weight: 600;">${machine.name || ''}</div>
                <div style="font-size: 12px; color: #666;">Tạo: ${formattedDate}</div>
            </td>
            <td>${machine.location || '<span style="color: #999;">Chưa có vị trí</span>'}</td>
            <td>
                <span class="admin-status-badge ${machine.status || 'active'}" style="
                    padding: 4px 8px; 
                    border-radius: 12px; 
                    font-size: 11px; 
                    font-weight: 600;
                    ${machine.status === 'active' ? 'background: #d4edda; color: #155724;' : 'background: #f8d7da; color: #721c24;'}
                ">
                    ${machine.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            </td>
            <td style="max-width: 200px; word-wrap: break-word;">
                ${machine.description || '<span style="color: #999;">Không có mô tả</span>'}
            </td>
            <td style="text-align: center;">
                <button class="btn-edit" onclick="editAdminMachine('${machine.id}')" title="Chỉnh sửa" 
                        style="margin-right: 5px; padding: 6px 10px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteAdminMachine('${machine.id}')" title="Xóa"
                        style="padding: 6px 10px; border: none; background: #dc3545; color: white; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        machinesList.appendChild(row);
    });
}

//TODO Mở form thêm/sửa máy========================================================================
function openAdminMachineForm(machineId = null) {
    try {
        // Reset form
        const form = document.getElementById('admin-machine-form');
        if (form) form.reset();
        
        const machineIdInput = document.getElementById('admin-machine-id');
        if (machineIdInput) machineIdInput.value = '';
        
        const titleElement = document.getElementById('admin-machine-form-title');
        
        if (machineId) {
            // Chế độ sửa
            if (titleElement) titleElement.textContent = 'Chỉnh sửa máy';
            loadAdminMachineForEdit(machineId);
        } else {
            // Chế độ thêm mới
            if (titleElement) titleElement.textContent = 'Thêm máy mới';
            
            // Sử dụng window.currentAdminModule hoặc currentAdminModule
            const moduleToUse = window.currentAdminModule || currentAdminModule;
            
            if (moduleToUse && moduleToUse.system_id) {
                const systemIdInput = document.getElementById('admin-machine-system-id');
                if (systemIdInput) systemIdInput.value = moduleToUse.system_id;
                
                // Hiển thị tên hệ thống
                if (typeof getSystemName === 'function') {
                    const systemName = getSystemName(moduleToUse.system_id);
                    const systemDisplayElement = document.getElementById('admin-machine-system-display');
                    if (systemDisplayElement) {
                        systemDisplayElement.textContent = systemName;
                    }
                }
            }
        }
        
        // Hiển thị modal
        const modal = document.getElementById('admin-machine-form-modal');
        if (modal) {
            modal.style.display = 'block';
        } else {
            console.error('Không tìm thấy modal form máy');
        }
    } catch (error) {
        console.error('Lỗi khi mở form máy:', error);
        if (typeof showToast === 'function') {
            showToast('Có lỗi khi mở form máy!', 'error');
        }
    }
}

//TODO Tải thông tin máy để chỉnh sửa========================================================================
async function loadAdminMachineForEdit(machineId) {
    try {
        showLoading('Đang tải thông tin máy...', 'Vui lòng đợi trong giây lát');
        
        const response = await fetch(`/api/machines/${machineId}`);
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin máy');
        }
        
        const machine = await response.json();
        
        // Điền thông tin vào form
        document.getElementById('admin-machine-id').value = machine.id;
        document.getElementById('admin-machine-name').value = machine.name || '';
        document.getElementById('admin-machine-location').value = machine.location || '';
        document.getElementById('admin-machine-status').value = machine.status || 'active';
        document.getElementById('admin-machine-description').value = machine.description || '';
        // Thêm thông tin hệ thống
if (machine.system_id) {
    const systemIdInput = document.getElementById('admin-machine-system-id');
    if (systemIdInput) systemIdInput.value = machine.system_id;
    
    // Hiển thị tên hệ thống
    if (typeof getSystemName === 'function') {
        const systemName = getSystemName(machine.system_id);
        const systemDisplayElement = document.getElementById('admin-machine-system-display');
        if (systemDisplayElement) {
            systemDisplayElement.textContent = systemName;
        }
    }
}
        
        hideLoading();
        
    } catch (error) {
        console.error('Lỗi khi tải thông tin máy:', error);
        hideLoading();
        showToast('Không thể tải thông tin máy!', 'error');
    }
}

//TODO Lưu máy (thêm mới hoặc cập nhật)========================================================================
async function saveAdminMachine() {
    try {
        // Lấy dữ liệu từ form
        const machineIdInput = document.getElementById('admin-machine-id');
        const nameInput = document.getElementById('admin-machine-name');
        const locationInput = document.getElementById('admin-machine-location');
        const statusInput = document.getElementById('admin-machine-status');
        const descriptionInput = document.getElementById('admin-machine-description');
        
        if (!nameInput || !nameInput.value.trim()) {
            if (typeof showToast === 'function') {
                showToast('Vui lòng nhập tên máy!', 'error');
            }
            return;
        }
        
        const machineId = machineIdInput ? machineIdInput.value : '';
        const name = nameInput.value.trim();
        const location = locationInput ? locationInput.value.trim() : '';
        const status = statusInput ? statusInput.value : 'active';
        const description = descriptionInput ? descriptionInput.value.trim() : '';
        
        let system_id;
const systemIdInput = document.getElementById('admin-machine-system-id');
if (machineId) {
    // Chế độ sửa - lấy từ form hoặc giữ nguyên
    system_id = systemIdInput ? systemIdInput.value : null;
    if (!system_id) {
        // Nếu không có trong form, lấy từ module hiện tại
        const moduleToUse = window.currentAdminModule || currentAdminModule;
        system_id = moduleToUse ? moduleToUse.system_id : null;
    }
} else {
    // Chế độ thêm mới - lấy từ module hiện tại
    const moduleToUse = window.currentAdminModule || currentAdminModule;
    system_id = moduleToUse ? moduleToUse.system_id : null;
}
        
        if (!system_id) {
            if (typeof showToast === 'function') {
                showToast('Không xác định được hệ thống!', 'error');
            }
            return;
        }
        
        const moduleToUse = window.currentAdminModule || currentAdminModule;
        const machineData = {
            name,
            location: location || null,
            status,
            description: description || null,
            system_id: system_id,
            module_id: moduleToUse ? moduleToUse.id : null
        };
        
        if (typeof showLoading === 'function') {
            showLoading(machineId ? 'Đang cập nhật máy...' : 'Đang thêm máy mới...', 'Vui lòng đợi');
        }
        
        let response;
        if (machineId) {
            response = await fetch(`/api/machines/${machineId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(machineData)
            });
        } else {
            response = await fetch('/api/machines', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(machineData)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Lỗi khi lưu máy');
        }
        
        const result = await response.json();
        
        // Đóng modal form
        const modal = document.getElementById('admin-machine-form-modal');
        if (modal) modal.style.display = 'none';
        
        // Tải lại danh sách máy
        if (typeof loadAdminMachines === 'function') {
            await loadAdminMachines();
        }
        
        if (typeof loadAdminMachinesForManagement === 'function') {
            const manageModal = document.getElementById('admin-manage-machines-modal');
            if (manageModal && manageModal.style.display === 'block') {
                const moduleToUse = window.currentAdminModule || currentAdminModule;
                const moduleId = moduleToUse ? moduleToUse.id : null;
                await loadAdminMachinesForManagement('', moduleId);
            }
        }
        
        // Tải lại modal chọn máy nếu đang mở
        const machineModal = document.getElementById('admin-machine-modal');
        if (machineModal && machineModal.style.display === 'block') {
            if (typeof loadAdminMachines === 'function') {
                await loadAdminMachines();
            }
        }
        
        // Tải lại modal chọn máy user nếu đang mở
        const userMachineModal = document.getElementById('user-machine-modal');
        if (userMachineModal && userMachineModal.style.display === 'block') {
            if (typeof loadUserMachines === 'function') {
                await loadUserMachines();
            }
        }
        
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        
        // if (typeof showToast === 'function') {
        //     showToast(machineId ? 'Đã cập nhật máy thành công!' : 'Đã thêm máy mới thành công!');
        // }
        
    } catch (error) {
        console.error('Lỗi khi lưu máy:', error);
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        if (typeof showToast === 'function') {
            showToast('Có lỗi khi lưu máy: ' + error.message, 'error');
        }
    }
}


//TODO Xóa máy========================================================================
async function handleDeleteAdminMachine(machineId) {
    // Hiện confirm dialog
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    
    if (!confirmModal || !confirmTitle || !confirmMessage) {
        // Fallback nếu không có modal confirm
        if (!confirm('Bạn có chắc chắn muốn xóa máy này?')) {
            return;
        }
        // Gọi hàm thực hiện xóa trực tiếp
        await performDeleteMachine(machineId);
        return;
    }
    
    // Cập nhật nội dung modal
    confirmTitle.textContent = 'Xác nhận xóa máy';
    confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa máy này? Hành động này không thể hoàn tác.';
    
    // Gán sự kiện cho nút xác nhận
    document.getElementById('confirm-yes').onclick = async function() {
        await performDeleteMachine(machineId);
        closeAllModals();
    };
    
    // Gán sự kiện cho nút hủy
    document.getElementById('confirm-no').onclick = function() {
        closeAllModals();
    };
    
    // Hiển thị modal
    confirmModal.style.display = 'block';
}

//TODO Thực hiện xóa máy========================================================================
async function performDeleteMachine(machineId) {
    try {
        showLoading('Đang xóa máy...', 'Vui lòng đợi');
    
    const response = await fetch(`/api/machines/${machineId}`, {
        method: 'DELETE'
    });
    
    // THÊM log để debug:
    console.log('Delete response status:', response.status);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        throw new Error(errorData.error || 'Lỗi khi xóa máy');
    }
        
        const result = await response.json();
        
        // Tải lại danh sách máy
        await Promise.all([
            loadAdminMachines(),
            loadAdminMachinesForManagement()
        ]);
        
        hideLoading();
        // showToast(result.message || 'Đã xóa máy thành công!');
        // showToast('Đã xóa máy thành công!');
        
    } catch (error) {
        console.error('Lỗi khi xóa máy:', error);
        hideLoading();
        showToast('Có lỗi khi xóa máy: ' + error.message, 'error');
    }
}



//TODO Sự kiện và khởi tạo========================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Sự kiện đóng modal chọn máy
    const closeAdminMachineModal = document.getElementById('admin-close-machine-modal');
    if (closeAdminMachineModal) {
        closeAdminMachineModal.addEventListener('click', function() {
            document.getElementById('admin-machine-modal').style.display = 'none';
        });
    }
    
    // Sự kiện tìm kiếm máy
    const adminMachineSearch = document.getElementById('admin-machine-search');
    if (adminMachineSearch) {
        adminMachineSearch.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            loadAdminMachines(searchTerm);
        });
    }
    
    // Sự kiện mở modal quản lý máy
    const adminManageMachinesBtn = document.getElementById('admin-manage-machines-btn');
if (adminManageMachinesBtn) {
    adminManageMachinesBtn.addEventListener('click', function() {
        // Gọi với tham số mặc định (không lọc theo module cụ thể)
        openAdminMachineManagementModal();
    });
}
    
    // Sự kiện đóng modal quản lý máy
    const closeAdminManageMachinesModal = document.getElementById('admin-close-manage-machines-modal');
    const closeAdminManageMachinesBtn = document.getElementById('admin-close-manage-machines-btn');
    
    if (closeAdminManageMachinesModal) {
        closeAdminManageMachinesModal.addEventListener('click', function() {
            document.getElementById('admin-manage-machines-modal').style.display = 'none';
        });
    }
    
    if (closeAdminManageMachinesBtn) {
        closeAdminManageMachinesBtn.addEventListener('click', function() {
            document.getElementById('admin-manage-machines-modal').style.display = 'none';
        });
    }
    
    // Sự kiện tìm kiếm trong quản lý máy
    const adminManageMachineSearch = document.getElementById('admin-manage-machine-search');
    if (adminManageMachineSearch) {
        adminManageMachineSearch.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            const moduleId = currentAdminModule ? currentAdminModule.id : null;
            loadAdminMachinesForManagement(searchTerm, moduleId);
        });
    }
    
    // Sự kiện thêm máy mới
    const adminAddMachineBtn = document.getElementById('admin-add-machine-btn');
if (adminAddMachineBtn) {
    adminAddMachineBtn.addEventListener('click', function() {
        // Cập nhật tên hệ thống hiển thị trong form (nếu element tồn tại)
        if (currentAdminModule) {
            const systemName = getSystemName(currentAdminModule.system_id);
            const systemDisplayElement = document.getElementById('admin-machine-system-display');
            
            if (systemDisplayElement) {
                systemDisplayElement.textContent = systemName;
            }
            // Có thể thêm console.log để debug
            console.log('Current module system:', systemName);
        }
        
        openAdminMachineForm();
    });
}
    
    // Sự kiện đóng form máy
    const closeAdminMachineFormModal = document.getElementById('admin-close-machine-form-modal');
    const adminCancelMachineBtn = document.getElementById('admin-cancel-machine-btn');
    
    if (closeAdminMachineFormModal) {
        closeAdminMachineFormModal.addEventListener('click', function() {
            document.getElementById('admin-machine-form-modal').style.display = 'none';
        });
    }
    
    if (adminCancelMachineBtn) {
        adminCancelMachineBtn.addEventListener('click', function() {
            document.getElementById('admin-machine-form-modal').style.display = 'none';
        });
    }
    
    // Sự kiện lưu máy
    const adminSaveMachineBtn = document.getElementById('admin-save-machine-btn');
    if (adminSaveMachineBtn) {
        adminSaveMachineBtn.addEventListener('click', function() {
            saveAdminMachine();
        });
    }
    
    // Sự kiện submit form
    const adminMachineForm = document.getElementById('admin-machine-form');
    if (adminMachineForm) {
        adminMachineForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAdminMachine();
        });
    }
    
    // Đóng modal khi click outside
    window.addEventListener('click', function(event) {
        const adminMachineModal = document.getElementById('admin-machine-modal');
        if (event.target === adminMachineModal) {
            adminMachineModal.style.display = 'none';
        }
    });



// Sự kiện đóng modal quản lý người dùng sản xuất - với kiểm tra tồn tại
const closeProductionUserModal = document.getElementById('close-production-user-modal');
const closeProductionUserBtn = document.getElementById('close-production-user-btn');

if (closeProductionUserModal && typeof closeProductionUserModal.addEventListener === 'function') {
    closeProductionUserModal.addEventListener('click', function() {
        const modal = document.getElementById('production-user-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

if (closeProductionUserBtn && typeof closeProductionUserBtn.addEventListener === 'function') {
    closeProductionUserBtn.addEventListener('click', function() {
        const modal = document.getElementById('production-user-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

// Đóng modal khi click outside
window.addEventListener('click', function(event) {
    const productionUserModal = document.getElementById('production-user-modal');
    if (productionUserModal && event.target === productionUserModal) {
        productionUserModal.style.display = 'none';
    }
});


});

// Hàm global để có thể gọi từ onclick
window.editAdminMachine = function(machineId) {
    openAdminMachineForm(machineId);
};

window.deleteAdminMachine = function(machineId) {
    handleDeleteAdminMachine(machineId);
};

window.openAdminMachineManagementModal = function(moduleId, systemId) {
    openAdminMachineManagementModal(moduleId, systemId);
};


function isProductionSystem(systemId) {
    const productionSystems = ['sanxuat-nm1', 'sanxuat-nm2', 'sanxuat-nm3'];
    return productionSystems.includes(systemId);
}
  

  
  


//! ====================================================================================================================================

//! =================================================================
//! PLANNING - WS TỔNG
//  Mô tả: Quản lý danh mục WS TỔNG, nhập từ Excel, xử lý dữ liệu
//! =================================================================


//TODO Thiết lập sự kiện cho Excel WS Tổng
function setupWsTongExcelEvents() {
    // Sự kiện cho nút nhập Excel WS Tổng
    const importWsTongExcelBtn = document.getElementById('import-ws-tong-excel-btn');
    if (importWsTongExcelBtn) {
        importWsTongExcelBtn.addEventListener('click', function() {
            const fileInput = document.getElementById('ws-tong-excel-input');
            if (fileInput) {
                fileInput.click();
            }
        });
    }
    
    // Xử lý file Excel WS Tổng khi người dùng chọn file
    const wsTongExcelInput = document.getElementById('ws-tong-excel-input');
    if (wsTongExcelInput) {
        wsTongExcelInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleWsTongExcelFile(e.target.files[0]);
            }
        });
    }
    
    // THÊM PHẦN NÀY - Sự kiện lưu và hủy WS Tổng
    const saveWsTongBtn = document.getElementById('save-ws-tong-btn');
    if (saveWsTongBtn) {
        saveWsTongBtn.addEventListener('click', saveWsTongData);
    }
    
    const cancelWsTongImportBtn = document.getElementById('cancel-ws-tong-import-btn');
    if (cancelWsTongImportBtn) {
        cancelWsTongImportBtn.addEventListener('click', cancelWsTongImport);
    }
    
    // Sự kiện đóng modal WS Tổng
    const closeWsTongPreview = document.getElementById('close-ws-tong-preview');
    if (closeWsTongPreview) {
        closeWsTongPreview.addEventListener('click', function() {
            document.getElementById('ws-tong-preview-modal').style.display = 'none';
            window.tempWsTongData = null;
        });
    }
}



// Sự kiện cho tab Planning
document.querySelectorAll('.tab[data-planning-tab]').forEach(tab => {
    tab.addEventListener('click', function() {
        // Loại bỏ active từ tất cả các tab planning
        document.querySelectorAll('.tab[data-planning-tab]').forEach(t => {
            t.classList.remove('active');
        });
        
        // Add active cho tab hiện tại
        this.classList.add('active');
        
        // Hiển thị nội dung tab tương ứng
        const tabContentId = this.getAttribute('data-planning-tab') + '-content';
        document.querySelectorAll('.planning-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(tabContentId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});


// Hàm xử lý file Excel WS Tổng
function handleWsTongExcelFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            
            // Cấu hình đọc file với hỗ trợ UTF-8
            const workbook = XLSX.read(data, {
                type: 'array',
                cellDates: true,
                cellNF: false,
                cellText: false,
                codepage: 65001 // UTF-8
            });
            
            // Lấy sheet đầu tiên
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Chuyển đổi sheet sang JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                raw: false,
                dateNF: 'yyyy-mm-dd',
                defval: ''
            });
            
            // Xử lý dữ liệu
            const wsTongList = [];
            
            // Bỏ qua hàng đầu tiên nếu chứa tiêu đề
            const startRow = (jsonData.length > 0 && 
                (String(jsonData[0][0] || '').toLowerCase().includes('ws') || 
                 String(jsonData[0][1] || '').toLowerCase().includes('po'))) ? 1 : 0;
            
            for (let i = startRow; i < jsonData.length; i++) {
                const row = jsonData[i];
                
                // Kiểm tra row có phải là array và có dữ liệu không
                if (Array.isArray(row) && row.length > 0) {
                    // Bỏ qua nếu không có số WS
                    if (!row[0]) continue;
                    
                    const wsTong = {
                        so_ws: String(row[0] || '').trim(),
                        so_po: String(row[1] || '').trim(),
                        khach_hang: String(row[2] || '').trim(),
                        ma_sp: String(row[3] || '').trim(),
                        sl_dh: String(row[4] || '').trim(),
                        s_con: String(row[5] || '').trim(),
                        so_mau_in: String(row[6] || '').trim(),
                        ma_khuon_be_dut: String(row[7] || '').trim(),
                        ma_khuon_be_noi: String(row[8] || '').trim(),
                        be_noi_be_dut: String(row[9] || '').trim(),
                        loai_can_phu: String(row[10] || '').trim(),
                        mang_acetat: String(row[11] || '').trim(),
                        qc_dan_lg: String(row[12] || '').trim(),
                        qc_dong_goi: String(row[13] || '').trim(),
                        thung_or_giay_goi: String(row[14] || '').trim(),
                        loai_giay_1: String(row[15] || '').trim(),
                        kho_1: String(row[16] || '').trim(),
                        chat_1: String(row[17] || '').trim(),
                        kg_1: String(row[18] || '').trim(),
                        loai_giay_2: String(row[19] || '').trim(),
                        kho_giay_2: String(row[20] || '').trim(),
                        kg_2: String(row[21] || '').trim(),
                        loai_giay_3: String(row[22] || '').trim(),
                        kho_giay_3: String(row[23] || '').trim(),
                        kg_3: String(row[24] || '').trim(),
                        chat_3: String(row[25] || '').trim(),
                        kho_3: String(row[26] || '').trim(),
                        chat_4: String(row[27] || '').trim(),
                        kho_4: String(row[28] || '').trim(),
                        loai_song: String(row[29] || '').trim(),
                        chat_5: String(row[30] || '').trim(),
                        kho_5: String(row[31] || '').trim(),
                        chat_6: String(row[32] || '').trim(),
                        kho_6: String(row[33] || '').trim(),
                        cong_doan_san_xuat_1: String(row[34] || '').trim(),
                        ngay_nhan_ws: String(row[35] || '').trim(),
                        sl_giay_can_cat: String(row[36] || '').trim(),
                        cong_doan_san_xuat_2: String(row[37] || '').trim(),
                        sl_bu_hao_in: String(row[38] || '').trim(),
                        sl_bu_hao_t_pham: String(row[39] || '').trim(),
                        sl_giay: String(row[40] || '').trim(),
                        sl_cat_giay: String(row[41] || '').trim(),
                        sl_giay_kh: String(row[42] || '').trim(),
                        gia_cong_in: String(row[43] || '').trim(),
                        gia_cong_ep_kim: String(row[44] || '').trim(),
                        gia_cong_can_phu: String(row[45] || '').trim(),
                        gia_cong_be: String(row[46] || '').trim()
                    };
                    
                    wsTongList.push(wsTong);
                }
            }
            
            if (wsTongList.length === 0) {
                showToast('Không tìm thấy dữ liệu WS Tổng trong file!', 'error');
                return;
            }
            
            // Hiển thị modal preview
            displayWsTongPreview(wsTongList);
            
            // Reset giá trị input file để có thể chọn lại cùng một file
            document.getElementById('ws-tong-excel-input').value = '';
            
        } catch (error) {
            console.error('Lỗi khi xử lý file Excel:', error);
            showToast('Lỗi khi xử lý file Excel! ' + error.message, 'error');
        }
    };
    
    reader.onerror = function(event) {
        console.error("Lỗi đọc file:", event.target.error);
        showToast('Lỗi khi đọc file!', 'error');
    };
    
    reader.readAsArrayBuffer(file);
}

// Hiển thị modal preview WS Tổng
function displayWsTongPreview(wsTongList) {
    const previewList = document.getElementById('ws-tong-preview-list');
    if (!previewList) return;
    
    previewList.innerHTML = '';
    
    if (wsTongList.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="47" class="text-center">Không có dữ liệu</td>';
        previewList.appendChild(emptyRow);
    } else {
        wsTongList.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="border: 1px solid #ddd; padding: 4px;">${item.so_ws || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.so_po || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.khach_hang || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.ma_sp || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.sl_dh || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.s_con || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.so_mau_in || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.ma_khuon_be_dut || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.ma_khuon_be_noi || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.be_noi_be_dut || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.loai_can_phu || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.mang_acetat || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.qc_dan_lg || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.qc_dong_goi || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.thung_or_giay_goi || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.loai_giay_1 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kho_1 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.chat_1 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kg_1 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.loai_giay_2 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kho_giay_2 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kg_2 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.loai_giay_3 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kho_giay_3 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kg_3 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.chat_3 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kho_3 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.chat_4 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kho_4 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.loai_song || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.chat_5 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kho_5 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.chat_6 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.kho_6 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.cong_doan_san_xuat_1 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.ngay_nhan_ws || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.sl_giay_can_cat || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.cong_doan_san_xuat_2 || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.sl_bu_hao_in || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.sl_bu_hao_t_pham || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.sl_giay || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.sl_cat_giay || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.sl_giay_kh || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.gia_cong_in || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.gia_cong_ep_kim || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.gia_cong_can_phu || ''}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.gia_cong_be || ''}</td>
            `;
            previewList.appendChild(row);
        });
    }
    
    // Hiển thị modal preview
    const modal = document.getElementById('ws-tong-preview-modal');
    if (modal) {
        modal.style.display = 'block';
    }
    
    // Lưu dữ liệu vào biến tạm thời
    window.tempWsTongData = wsTongList;
}

// Hàm lưu dữ liệu WS Tổng
async function saveWsTongData() {
    try {
        if (!window.tempWsTongData || window.tempWsTongData.length === 0) {
            showToast('Không có dữ liệu để lưu!', 'error');
            return;
        }
        
        // Hiển thị thông báo đang xử lý
        showToast('Đang xử lý dữ liệu...', 'success');
        
        try {
            const response = await fetch('/api/ws-tong/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    wsTongList: window.tempWsTongData
                })
            });
            
            // Kiểm tra kiểu dữ liệu trả về
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.indexOf('application/json') === -1) {
                throw new Error('Server trả về dữ liệu không phải JSON. Vui lòng kiểm tra kết nối server.');
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response error:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || 'Lỗi khi lưu dữ liệu WS Tổng');
                } catch (jsonError) {
                    if (errorText.includes('<!DOCTYPE html>')) {
                        throw new Error('Server trả về HTML thay vì JSON. Có thể server gặp lỗi 500.');
                    } else {
                        throw new Error('Lỗi khi lưu dữ liệu: ' + errorText.substring(0, 100));
                    }
                }
            }
            
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                const responseText = await response.text();
                console.log('Raw response:', responseText);
                throw new Error('Không thể xử lý phản hồi từ server');
            }
            
            // Xóa dữ liệu tạm và đóng modal
            window.tempWsTongData = null;
            document.getElementById('ws-tong-preview-modal').style.display = 'none';
            
            // Tải lại danh sách WS Tổng
            await loadWsTong();
            
            showToast(result.message || 'Đã lưu danh mục WS Tổng thành công!');
        } catch (fetchError) {
            // Kiểm tra xem lỗi có phải từ mạng không
            if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
                console.error('Network error:', fetchError);
                showToast('Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng.', 'error');
            } else {
                console.error('Error during fetch:', fetchError);
                showToast(fetchError.message || 'Lỗi khi gửi dữ liệu đến server', 'error');
            }
        }
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu WS Tổng:', error);
        showToast(error.message || 'Lỗi khi lưu dữ liệu WS Tổng!', 'error');
    }
}

// Hủy nhập dữ liệu WS Tổng
function cancelWsTongImport() {
    window.tempWsTongData = null;
    document.getElementById('ws-tong-preview-modal').style.display = 'none';
}

// Tải danh sách WS Tổng
async function loadWsTong() {
    try {
        const wsTongList = document.getElementById('ws-tong-list');
        if (!wsTongList) {
            console.warn('Element #ws-tong-list not found');
            return;
        }
        
        wsTongList.innerHTML = '<tr><td colspan="48" class="text-center">Đang tải danh sách WS Tổng...</td></tr>';
        
        const response = await fetch('/api/ws-tong/list');
        if (!response.ok) {
            throw new Error('Không thể lấy danh sách WS Tổng');
        }
        
        const wsTongData = await response.json();
        
        // Hiển thị danh sách WS Tổng
        displayWsTongList(wsTongData);
    } catch (error) {
        console.error('Lỗi khi tải danh sách WS Tổng:', error);
        const wsTongList = document.getElementById('ws-tong-list');
        if (wsTongList) {
            wsTongList.innerHTML = `<tr><td colspan="48" class="text-center" style="color: red;">Lỗi: ${error.message}</td></tr>`;
        }
    }
}

// Hiển thị danh sách WS Tổng
function displayWsTongList(wsTongData) {
    const wsTongList = document.getElementById('ws-tong-list');
    if (!wsTongList) return;
    
    wsTongList.innerHTML = '';
    
    if (!wsTongData || wsTongData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="48" class="text-center">Không có dữ liệu WS Tổng</td>';
        wsTongList.appendChild(emptyRow);
        return;
    }
    
    wsTongData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-nowrap" style="padding: 8px;">${item.so_ws || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.so_po || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.khach_hang || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.ma_sp || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.sl_dh || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.s_con || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.so_mau_in || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.ma_khuon_be_dut || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.ma_khuon_be_noi || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.be_noi_be_dut || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.loai_can_phu || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.mang_acetat || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.qc_dan_lg || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.qc_dong_goi || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.thung_or_giay_goi || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.loai_giay_1 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kho_1 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.chat_1 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kg_1 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.loai_giay_2 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kho_giay_2 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kg_2 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.loai_giay_3 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kho_giay_3 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kg_3 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.chat_3 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kho_3 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.chat_4 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kho_4 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.loai_song || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.chat_5 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kho_5 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.chat_6 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.kho_6 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.cong_doan_san_xuat_1 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.ngay_nhan_ws || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.sl_giay_can_cat || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.cong_doan_san_xuat_2 || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.sl_bu_hao_in || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.sl_bu_hao_t_pham || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.sl_giay || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.sl_cat_giay || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.sl_giay_kh || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.gia_cong_in || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.gia_cong_ep_kim || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.gia_cong_can_phu || ''}</td>
            <td class="text-nowrap" style="padding: 8px;">${item.gia_cong_be || ''}</td>
        `;
        wsTongList.appendChild(row);
    });
}

// Hàm sửa WS Tổng - placeholder cho tương lai
window.editWsTong = async function(id) {
    showToast('Chức năng chỉnh sửa sẽ được phát triển trong phiên bản tiếp theo!', 'info');
};

// Hàm xóa WS Tổng
window.deleteWsTong = function(id) {
    // Hiển thị modal xác nhận
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    
    confirmTitle.textContent = 'Xác nhận xóa';
    confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa bản ghi WS Tổng này?';
    
    // Gán sự kiện cho nút xác nhận
    document.getElementById('confirm-yes').onclick = async function() {
        try {
            const response = await fetch(`/api/ws-tong/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Lỗi khi xóa WS Tổng');
            }
            
            closeAllModals();
            loadWsTong();
            showToast('Đã xóa WS Tổng thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa WS Tổng:', error);
            showToast(error.message || 'Lỗi khi xóa WS Tổng!', 'error');
            closeAllModals();
        }
    };
    
    // Gán sự kiện cho nút hủy
    document.getElementById('confirm-no').onclick = function() {
        closeAllModals();
    };
    
    // Hiển thị modal
    confirmModal.style.display = 'block';
};



// Đóng modal khi nhấn ra ngoài cho WS Tổng
window.addEventListener('click', function(event) {
    const wsTongModal = document.getElementById('ws-tong-preview-modal');
    
    if (event.target === wsTongModal) {
        wsTongModal.style.display = 'none';
        window.tempWsTongData = null;
    }
});

// Load WS Tổng khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    // Load danh sách WS Tổng
    setTimeout(() => {
        if (document.getElementById('ws-tong-list')) {
            loadWsTong();
        }
    }, 1000);
});






//! =================================================================
//! PRODUCTION USERS MANAGEMENT
//  Mô tả: Quản lý người dùng cho báo cáo sản xuất
//! =================================================================

// Biến lưu trữ module hiện tại cho production users
var currentProductionModule = null;

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