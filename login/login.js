document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('password-toggle');
    const loginBtn = document.getElementById('login-btn');
    const rememberCheckbox = document.getElementById('remember');
    const usernamePrefix = document.getElementById('username-prefix');
    const fullUsername = document.getElementById('full-username');
    
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const loginError = document.getElementById('login-error');
    
    // Kiểm tra nếu có thông tin đăng nhập được lưu trước đó
    checkSavedCredentials();
    
    // Cập nhật tên đăng nhập đầy đủ khi prefix thay đổi
    usernamePrefix.addEventListener('change', function() {
        updateFullUsername();
    });
    
    // Thêm sự kiện input để kiểm tra khi người dùng nhập "admin"
    usernameInput.addEventListener('input', function() {
        const inputValue = usernameInput.value.trim().toLowerCase();
        const prefixSelector = document.querySelector('.prefix-selector');
        
        // Cập nhật trạng thái hiển thị của dropdown dựa trên việc nhập "admin"
        if (inputValue === 'admin') {
            // Có thể thêm hiệu ứng mờ cho phần chọn prefix nếu muốn
            prefixSelector.style.opacity = '0.5';
        } else {
            prefixSelector.style.opacity = '1';
        }
        
        updateFullUsername();
        usernameError.textContent = '';
        loginError.textContent = '';
    });
    
    // Hàm cập nhật tên đăng nhập đầy đủ
    function updateFullUsername() {
        const code = usernameInput.value.trim();
        
        // Nếu nhập "admin", không thêm tiền tố
        if (code.toLowerCase() === 'admin') {
            fullUsername.value = 'admin';
        } else {
            const prefix = usernamePrefix.value;
            fullUsername.value = prefix + '-' + code;
        }
    }
    
    // Hiển thị/ẩn mật khẩu
    passwordToggle.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            passwordToggle.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });
    
    // Xử lý đăng nhập khi nhấn nút
    loginBtn.addEventListener('click', handleLogin);
    
    // Xử lý đăng nhập khi nhấn Enter ở các trường nhập liệu
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    usernameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            passwordInput.focus();
        }
    });
    
    // Xóa thông báo lỗi khi người dùng nhập
    passwordInput.addEventListener('input', function() {
        passwordError.textContent = '';
        loginError.textContent = '';
    });
    
    function handleLogin() {
        // Reset thông báo lỗi
        usernameError.textContent = '';
        passwordError.textContent = '';
        loginError.textContent = '';
        
        // Validate đầu vào
        let isValid = true;
        
        if (!usernameInput.value.trim()) {
            usernameError.textContent = 'Vui lòng nhập số ID';
            isValid = false;
        }
        
        if (!passwordInput.value.trim()) {
            passwordError.textContent = 'Vui lòng nhập mật khẩu';
            isValid = false;
        }
        
        if (isValid) {
            // Tạo tên đăng nhập đầy đủ
            updateFullUsername();
            
            // Hiển thị trạng thái đang đăng nhập
            loginBtn.disabled = true;
            loginBtn.textContent = 'Đang đăng nhập...';
            
            // Xác định tên đăng nhập để gửi đi
            const usernameToSend = usernameInput.value.trim().toLowerCase() === 'admin' ? 
                'admin' : fullUsername.value;
            
            // Gọi API đăng nhập
            fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: usernameToSend,
                    password: passwordInput.value.trim()
                }),
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Đăng nhập thất bại');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Lưu thông tin đăng nhập nếu chọn "Ghi nhớ đăng nhập"
                    if (rememberCheckbox.checked) {
                        saveCredentials(usernameInput.value.trim(), usernamePrefix.value);
                    } else {
                        clearSavedCredentials();
                    }
                    
                    // Lưu thông tin người dùng và quyền truy cập vào session storage
                    sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                    sessionStorage.setItem('userPermissions', JSON.stringify(data.permissions));
                    
                    // Chuyển hướng dựa vào quyền truy cập
                    if (data.permissions.isAdmin) {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/user';
                    }
                } else {
                    loginError.textContent = 'Đăng nhập thất bại';
                    resetLoginButton();
                }
            })
            .catch(error => {
                loginError.textContent = error.message;
                resetLoginButton();
            });
        }
    }
    
    function resetLoginButton() {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Đăng nhập';
    }
    
    function saveCredentials(username, prefix) {
        // Lưu thông tin đăng nhập
        localStorage.setItem('rememberedUser', username);
        
        // Nếu không phải admin, lưu cả prefix
        if (username.toLowerCase() !== 'admin') {
            localStorage.setItem('rememberedPrefix', prefix);
        }
        
        localStorage.setItem('hasRemembered', 'true');
    }
    
    function clearSavedCredentials() {
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('rememberedPrefix');
        localStorage.removeItem('hasRemembered');
    }
    
    function checkSavedCredentials() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        const rememberedPrefix = localStorage.getItem('rememberedPrefix');
        const hasRemembered = localStorage.getItem('hasRemembered');
        
        if (hasRemembered && rememberedUser) {
            usernameInput.value = rememberedUser;
            
            // Nếu là "admin", ẩn phần chọn tiền tố
            if (rememberedUser.toLowerCase() === 'admin') {
                // Không thay đổi tiền tố, giữ nguyên mặc định
            } else if (rememberedPrefix) {
                usernamePrefix.value = rememberedPrefix;
            }
            
            updateFullUsername();
            rememberCheckbox.checked = true;
            // Focus vào field mật khẩu để người dùng chỉ cần nhập mật khẩu
            passwordInput.focus();
        }
    }
});