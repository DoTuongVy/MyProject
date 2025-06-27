// File: admin-module-sticky.js
// Script này cần được include vào tất cả các trang module

(function() {
    'use strict';
    
    // Chờ DOM load xong
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdminStickyBar);
    } else {
        initAdminStickyBar();
    }
    
    function initAdminStickyBar() {
        // Lấy thông tin user từ sessionStorage
        const currentUser = getCurrentUser();
        
        // Chỉ áp dụng cho admin
        if (!currentUser || currentUser.role !== 'admin') {
            return; // User thường giữ nguyên sticky bar cũ
        }
        
        // Nếu đã có admin sticky bar thì không tạo nữa
        if (document.getElementById('admin-module-sticky')) {
            return;
        }
        
        // Ẩn sticky bar cũ nếu có
        hideOriginalStickyBar();
        
        // Tạo admin sticky bar
        createAdminStickyBar(currentUser);
    }
    
    function getCurrentUser() {
        try {
            const userString = sessionStorage.getItem('currentUser');
            return userString ? JSON.parse(userString) : null;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin user:', error);
            return null;
        }
    }
    
    function hideOriginalStickyBar() {
        // Ẩn các sticky bar có thể có của user
        const selectors = [
            '.top-bar',
            '.sticky-bar', 
            '.user-bar',
            '.header-bar',
            '[class*="sticky"]',
            '[class*="header"]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Chỉ ẩn nếu có position fixed/sticky và ở top
                const style = window.getComputedStyle(el);
                if ((style.position === 'fixed' || style.position === 'sticky') && 
                    (style.top === '0px' || parseInt(style.top) < 60)) {
                    el.style.display = 'none';
                }
            });
        });
    }
    
    function createAdminStickyBar(currentUser) {
        // Lấy tên module từ title trang hoặc URL
        const moduleName = getModuleName();
        const systemName = getSystemName();
        
        // Tạo sticky bar container
        const stickyBar = document.createElement('div');
        stickyBar.id = 'admin-module-sticky';
        stickyBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 55px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            z-index: 99999;
            box-shadow: 0 2px 15px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            backdrop-filter: blur(10px);
            animation: adminStickySlideDown 0.4s ease-out;
        `;
        
        stickyBar.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
                <!-- Admin Info -->
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="
                        background: rgba(255, 215, 0, 0.2);
                        padding: 6px 12px;
                        border-radius: 20px;
                        border: 1px solid rgba(255, 215, 0, 0.3);
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    ">
                        <i class="fas fa-crown" style="color: #ffd700; font-size: 14px;"></i>
                        <span style="font-weight: 600; font-size: 12px;">ADMIN</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user-circle" style="font-size: 20px; opacity: 0.9;"></i>
                        <span style="font-weight: 500;">${currentUser.fullname || currentUser.employee_id || 'Admin'}</span>
                    </div>
                </div>
                
                <!-- Separator -->
                <div style="height: 25px; width: 1px; background: rgba(255,255,255,0.2);"></div>
                
                <!-- Module Info -->
                <div style="display: flex; align-items: center; gap: 8px; opacity: 0.9;">
                    <i class="fas fa-cube" style="font-size: 16px;"></i>
                    <div style="display: flex; flex-direction: column; line-height: 1.2;">
                        <span style="font-size: 12px; opacity: 0.8;">${systemName}</span>
                        <span style="font-size: 13px; font-weight: 500;">${moduleName}</span>
                    </div>
                </div>
            </div>
            
            <!-- Actions -->
            <div style="display: flex; align-items: center; gap: 12px;">
                <button id="admin-home-btn" style="
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.25);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 25px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    font-family: inherit;
                " onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='translateY(-1px)'"
                   onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='translateY(0)'">
                    <i class="fas fa-home" style="font-size: 12px;"></i>
                    <span>Trang chủ</span>
                </button>
                
                <button id="admin-logout-btn" style="
                    background: rgba(255,69,58,0.8);
                    border: 1px solid rgba(255,69,58,0.6);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 25px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    font-family: inherit;
                " onmouseover="this.style.background='rgba(255,69,58,1)'; this.style.transform='translateY(-1px)'"
                   onmouseout="this.style.background='rgba(255,69,58,0.8)'; this.style.transform='translateY(0)'">
                    <i class="fas fa-sign-out-alt" style="font-size: 12px;"></i>
                    <span>Đăng xuất</span>
                </button>
                
                <button id="admin-minimize-btn" style="
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    padding: 8px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    transition: all 0.3s ease;
                    width: 32px;
                    height: 32px;
                " onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1.1)'"
                   onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='scale(1)'"
                   title="Thu gọn thanh admin">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
        `;
        
        // Thêm vào đầu body
        document.body.insertBefore(stickyBar, document.body.firstChild);
        
        // Điều chỉnh padding của body
        adjustBodyPadding();
        
        // Thêm CSS styles
        addAdminStickyStyles();
        
        // Thêm Font Awesome nếu chưa có
        ensureFontAwesome();
        
        // Gắn sự kiện
        attachEventListeners(stickyBar);
    }
    
    function getModuleName() {
        // Thử lấy từ title
        let title = document.title;
        if (title && title !== 'Document') {
            return title.replace(/VISINGPACK/gi, '').replace(/[-|]/g, '').trim();
        }
        
        // Thử lấy từ URL
        const path = window.location.pathname;
        const segments = path.split('/').filter(s => s);
        
        if (segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            return lastSegment.replace('.html', '').replace(/[-_]/g, ' ');
        }
        
        return 'Module';
    }
    
    function getSystemName() {
        const path = window.location.pathname;
        
        if (path.includes('/QLVT/')) return 'Quản lý Vật tư';
        if (path.includes('/baocao/')) return 'Báo cáo';
        if (path.includes('/admin/')) return 'Quản trị hệ thống';
        
        return 'Hệ thống';
    }
    
    function adjustBodyPadding() {
        const originalPadding = window.getComputedStyle(document.body).paddingTop;
        const originalMargin = window.getComputedStyle(document.body).marginTop;
        
        document.body.style.paddingTop = `calc(${originalPadding} + 55px)`;
        
        // Lưu giá trị gốc để restore khi cần
        document.body.setAttribute('data-original-padding', originalPadding);
        document.body.setAttribute('data-original-margin', originalMargin);
    }
    
    function addAdminStickyStyles() {
        if (document.getElementById('admin-sticky-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'admin-sticky-styles';
        style.textContent = `
            @keyframes adminStickySlideDown {
                from { 
                    transform: translateY(-100%); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
            }
            
            @keyframes adminStickyFadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            #admin-module-sticky button:active {
                transform: scale(0.95) !important;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                #admin-module-sticky {
                    padding: 0 15px !important;
                    font-size: 12px !important;
                    height: 50px !important;
                }
                
                #admin-module-sticky button span {
                    display: none !important;
                }
                
                #admin-module-sticky > div:first-child > div:nth-child(3) {
                    display: none !important;
                }
                
                #admin-module-sticky > div:first-child > div:nth-child(2) {
                    display: none !important;
                }
            }
            
            @media (max-width: 480px) {
                #admin-module-sticky {
                    height: 45px !important;
                }
                
                #admin-module-sticky button {
                    padding: 6px 8px !important;
                    font-size: 11px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    function ensureFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    }
    
    function attachEventListeners(stickyBar) {
        // Nút Trang chủ
        const homeBtn = document.getElementById('admin-home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', function() {
                // Quay về trang admin - tab giao diện người dùng
                window.location.href = '/admin/admin.html#user-interface';
            });
        }
        
        // Nút Đăng xuất
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    // Xóa thông tin đăng nhập
                    sessionStorage.removeItem('currentUser');
                    sessionStorage.removeItem('userPermissions');
                    
                    // Chuyển về trang login
                    window.location.href = '/login/login.html';
                }
            });
        }
        
        // Nút Thu gọn
        const minimizeBtn = document.getElementById('admin-minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', function() {
                minimizeStickyBar(stickyBar);
            });
        }
    }
    
    function minimizeStickyBar(stickyBar) {
        // Ẩn sticky bar
        stickyBar.style.transform = 'translateY(-100%)';
        stickyBar.style.opacity = '0';
        
        // Restore padding
        const originalPadding = document.body.getAttribute('data-original-padding') || '0px';
        document.body.style.paddingTop = originalPadding;
        
        // Tạo nút restore
        const restoreBtn = document.createElement('div');
        restoreBtn.id = 'admin-restore-btn';
        restoreBtn.style.cssText = `
            position: fixed;
            top: 15px;
            right: 15px;
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 99998;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            animation: adminStickyFadeIn 0.3s ease-out;
        `;
        restoreBtn.innerHTML = '<i class="fas fa-crown" style="font-size: 16px; color: #ffd700;"></i>';
        restoreBtn.title = 'Hiển thị lại thanh Admin';
        
        restoreBtn.addEventListener('click', function() {
            // Hiện lại sticky bar
            stickyBar.style.transform = 'translateY(0)';
            stickyBar.style.opacity = '1';
            
            // Restore padding
            adjustBodyPadding();
            
            // Xóa nút restore
            document.body.removeChild(restoreBtn);
        });
        
        restoreBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(10deg)';
            this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });
        
        restoreBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        });
        
        document.body.appendChild(restoreBtn);
    }
    
})();