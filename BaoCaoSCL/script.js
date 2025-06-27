//! ====================================================================================================================================
//! =================================================================
//! KHỞI TẠO VÀ QUẢN LÝ FORM
//  Mô tả: Xử lý ban đầu, load dữ liệu, và quản lý sự kiện chung
//! =================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Kiểm tra đăng nhập
    checkAuthentication();

    // Khởi tạo form
    initializeForm();

    // Tải dữ liệu người dùng
    loadUserInfo();

    // Thiết lập các sự kiện
    setupEvents();

    // Gọi select của mã số cuộn
    setupMaSoCuonSelect();

    // Ẩn báo cáo dừng máy ban đầu
    const machineReport = document.getElementById('machineReport');
    if (machineReport) {
        machineReport.style.display = 'none';
    }

    // Đặt tiến độ ban đầu
    updateProgress();

    // Gọi trực tiếp hàm thiết lập sự kiện cho nút xác nhận
    setupManualConfirmButton();

    // Debug - kiểm tra trạng thái các nút
    setTimeout(checkButtonsStatus, 1000);

// Khởi tạo cơ chế cập nhật khi trang đã tải xong
setupAutomaticDataUpdate();

    






});

//todo Hàm xử lý sự kiện cho trường số phiếu để tránh trùng lặp "PSC" khi dán===========================================
document.addEventListener('DOMContentLoaded', function() {
    const soPhieuElement = document.getElementById('soPhieu');
    if (soPhieuElement) {
        // Thiết lập giá trị mặc định cho số phiếu
        if (!soPhieuElement.value) soPhieuElement.value = "PSC";
        
        // Xử lý sự kiện paste
        soPhieuElement.addEventListener('paste', function(e) {
            // Ngăn chặn hành vi paste mặc định
            e.preventDefault();
            
            // Lấy văn bản được dán
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            
            // Lấy vị trí selection hiện tại
            const startPos = this.selectionStart;
            const endPos = this.selectionEnd;
            
            // Xử lý văn bản được dán - loại bỏ PSC trùng lặp
            let processedText = pastedText.replace(/PSC/gi, '');
            
            // Lấy giá trị hiện tại của input
            let currentValue = this.value;
            
            // Nếu không có selection, chỉ thêm vào vị trí hiện tại
            if (startPos === endPos) {
                // Chèn vào vị trí con trỏ
                const newValue = currentValue.substring(0, startPos) + processedText + currentValue.substring(endPos);
                
                // Đảm bảo có PSC ở đầu
                this.value = newValue.startsWith('PSC') ? newValue : 'PSC' + newValue;
            } else {
                // Thay thế phần text đã chọn
                const newValue = currentValue.substring(0, startPos) + processedText + currentValue.substring(endPos);
                
                // Đảm bảo có PSC ở đầu
                this.value = newValue.startsWith('PSC') ? newValue : 'PSC' + newValue;
            }
            
            // Đặt lại vị trí con trỏ sau khi paste
            const newCursorPos = startPos + processedText.length;
            this.setSelectionRange(newCursorPos, newCursorPos);
            
            // Kích hoạt sự kiện input để xử lý các trường hợp khác
            this.dispatchEvent(new Event('input'));
        });
        
        // Xử lý sự kiện input để đảm bảo luôn có PSC ở đầu
        soPhieuElement.addEventListener('input', function() {
            let value = this.value;
            
            // Nếu giá trị rỗng, đặt lại thành PSC
            if (!value) {
                this.value = "PSC";
                return;
            }
            
            // Nếu không bắt đầu bằng PSC, thêm PSC vào đầu
            if (!value.toUpperCase().startsWith('PSC')) {
                this.value = "PSC" + value;
                return;
            }
            
            // Loại bỏ các PSC trùng lặp ở giữa chuỗi
            let cleaned = value.replace(/PSC/i, 'PREFIX_PLACEHOLDER');
            cleaned = cleaned.replace(/PSC/gi, '');
            this.value = cleaned.replace('PREFIX_PLACEHOLDER', 'PSC');
        });
        
        // Thêm sự kiện focus để chọn phần sau PSC khi focus
        soPhieuElement.addEventListener('focus', function() {
            if (this.value === 'PSC') {
                // Chọn toàn bộ nội dung
                this.select();
            }
        });
    }
});

//todo Khởi tạo form và thiết lập giá trị mặc định======================================================
function initializeForm() {
    // Đặt ngày hiện tại
    const today = new Date();
    const formattedDate = formatDate(today);

    // Đặt ca làm việc dựa vào thời gian hiện tại
    const currentHour = today.getHours();
    let shift = "Ca A"; // Mặc định ca A

    if (currentHour >= 14 && currentHour < 22) {
        shift = "Ca B";
    } else if ((currentHour >= 22 && currentHour <= 23) || (currentHour >= 0 && currentHour < 6)) {
        shift = "Ca C";
    }

    // Thiết lập giá trị mặc định cho các trường
    const caElement = document.getElementById('ca');
    if (caElement) caElement.value = shift;

    // Thiết lập giá trị mặc định cho số phiếu
    const soPhieuElement = document.getElementById('soPhieu');
    if (soPhieuElement && !soPhieuElement.value) soPhieuElement.value = "PSC";
}

//todo Kiểm tra đăng nhập và quyền truy cập========================================================
function checkAuthentication() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '/login/login.html';
        return false;
    }

    // Kiểm tra quyền truy cập vào module này
    // (Nếu cần triển khai thêm)

    return true;
}

//todo Tải thông tin người dùng hiện tại========================================================
function loadUserInfo() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Hiển thị thông tin người dùng
        const nguoiElement = document.getElementById('nguoi');
        if (nguoiElement) {
            nguoiElement.value = `${currentUser.fullname || ''} - ${currentUser.employee_id || ''}`;
            nguoiElement.setAttribute('data-user-id', currentUser.id);
        }
    }
}

//todo Thiết lập các sự kiện========================================================
function setupEvents() {
    // Sự kiện khi thay đổi số phiếu và thứ tự
    const soPhieuElement = document.getElementById('soPhieu');
    const thuTuElement = document.getElementById('thuTu');

    if (soPhieuElement && thuTuElement) {
        // Xử lý sự kiện khi số phiếu thay đổi
        soPhieuElement.addEventListener('input', function () {
            // Reset dropdown thứ tự về giá trị mặc định
            thuTuElement.value = '-- Thứ tự --';

            // Xóa tất cả các option cũ (ngoại trừ option đầu tiên)
            while (thuTuElement.options.length > 1) {
                thuTuElement.remove(1);
            }
        });

        // Bỏ sự kiện change và sử dụng sự kiện blur (khi rời khỏi trường)
        soPhieuElement.addEventListener('blur', searchPhieuSangCuon);

        // Thêm sự kiện change cho trường thứ tự
        thuTuElement.addEventListener('change', searchPhieuSangCuon);
    }

    // Thiết lập sự kiện cho select mã số cuộn
    setupMaSoCuonSelect();

    // Sự kiện khi thay đổi dữ liệu của form
    setupFormChangeEvents();

    // Sự kiện cho nút bắt đầu
    setupStartButtonEvent();

    // Sự kiện cho nút xác nhận
    setupConfirmButtonEvent();
}

// Hàm debounce để tránh gọi nhiều lần khi người dùng đang nhập
function debounce(func, delay) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}


//todo Lấy thông tin người dùng từ session storage========================================================
function getCurrentUser() {
    const userString = sessionStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
}

//todo Định dạng ngày tháng========================================================
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


//todo Hàm reset form=======================================================================================
function resetForm() {
    // Hiển thị hộp thoại xác nhận
    // if (!confirm('Bạn có chắc chắn muốn reset form? Tất cả dữ liệu sẽ bị xóa trừ Ca và Người thực hiện.')) {
    //   return; // Nếu người dùng không xác nhận, không làm gì cả
    // }
    
    // Lưu giữ giá trị Ca và người thực hiện
    const caValue = document.getElementById('ca')?.value || '';
    const nguoiValue = document.getElementById('nguoi')?.value || '';
    
    // RESET PHẦN BẮT ĐẦU BÁO CÁO
    // Danh sách các trường cần reset trong phần bắt đầu
    const startFields = [
      'soPhieu', 'thuTu', 'ws',
      'maVatTu', 'khoCanSang', 'khoSanPham', 'khachHang',
      'trongLuong', 'inputSoID'
    ];
    
    // Các trường input vị trí
    const viTriInputs = document.querySelectorAll('.row.g-2.mb-4 .col-md-4 input');
    
    // Reset các trường cơ bản
    startFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        // Trường hợp đặc biệt cho số phiếu: giữ "PSC"
        if (fieldId === 'soPhieu') {
          element.value = 'PSC';
        } else {
          element.value = '';
        }
      }
    });
    
    // Reset các trường vị trí
    viTriInputs.forEach(input => {
      input.value = '';
      input.style.opacity = '';
    });
    
    // Reset dropdown mã số cuộn
    const maSoCuonSelect = document.getElementById('maSoCuonSelect');
    const maSoCuonInput = document.getElementById('maSoCuon');
    const maSoCuonInputContainer = document.getElementById('maSoCuonInputContainer');
    
    if (maSoCuonSelect) maSoCuonSelect.selectedIndex = 0;
    if (maSoCuonInput) maSoCuonInput.value = '';
    if (maSoCuonInputContainer) maSoCuonInputContainer.style.display = 'none';
    
    // Reset các dropdown vị trí
    const viTriSelects = [
      document.getElementById('viTri1Select'),
      document.getElementById('viTri2Select'),
      document.getElementById('viTri3Select')
    ];
    
    viTriSelects.forEach(select => {
      if (select) {
        select.selectedIndex = 0;
        select.disabled = true;
      }
    });
    
    // Reset radio button số ID
    const khongCoID = document.getElementById('khongCoID');
    if (khongCoID) khongCoID.checked = true;
    
    const inputSoID = document.getElementById('inputSoID');
    if (inputSoID) {
      inputSoID.disabled = true;
      inputSoID.classList.remove('is-invalid');
      
      // Xóa thông báo lỗi nếu có
      const invalidFeedback = inputSoID.nextElementSibling;
      if (invalidFeedback && invalidFeedback.classList.contains('invalid-feedback')) {
        invalidFeedback.remove();
      }
    }
    
    // RESET PHẦN KẾT THÚC BÁO CÁO
    // Reset các trường khổ cần sang
    const khoCanSangOutputs = document.querySelectorAll('.row .col-6:first-child input');
    khoCanSangOutputs.forEach(input => {
      input.value = '';
    });
    
    // Reset số mét và sử dụng
    const soMetInput = document.querySelector('.col-6 .row.g-2 .col:first-child input');
    if (soMetInput) soMetInput.value = '';
    
    const suDungSelect = document.querySelector('.col-6 .row.g-2 .col:last-child select');
    if (suDungSelect) suDungSelect.selectedIndex = 0;
    
    // Reset số kg nhập tay
    const soKgInputs = document.querySelectorAll('.col-6:first-child .d-flex.gap-2.mb-3 input');
    soKgInputs.forEach(input => {
      input.value = '';
    });
    
    // Reset phế liệu
    const pheLieuDauCuon = document.querySelector('.col-6:nth-child(2) .row.g-2 .col:nth-child(1) input');
    const pheLieuSanXuat = document.querySelector('.col-6:nth-child(2) .row.g-2 .col:nth-child(2) input');
    
    if (pheLieuDauCuon) pheLieuDauCuon.value = '';
    if (pheLieuSanXuat) pheLieuSanXuat.value = '';
    
    // Reset ghi chú
    const ghiChu = document.querySelector('.col-6:first-child textarea');
    if (ghiChu) ghiChu.value = '';
    
    // Reset khổ sai
    const khoSaiInputs = document.querySelectorAll('.col-6 .mb-3:nth-of-type(2) input');
    khoSaiInputs.forEach(input => {
      input.value = '';
    });
    
    // Reset số mét sai
    const soMetSai = document.querySelector('.col-6 .mb-3:nth-of-type(3) input');
    if (soMetSai) soMetSai.value = '';
    
    // Reset phần dừng máy
    const btnNo = document.getElementById('btnNo');
    const btnYes = document.getElementById('btnYes');
    const machineReport = document.getElementById('machineReport');
    
    if (btnNo && btnYes && machineReport) {
      // Reset style và trạng thái của các nút
      btnNo.style.backgroundColor = '';
      btnNo.style.color = '';
      btnYes.style.backgroundColor = '';
      btnYes.style.color = '';
      
      // Ẩn phần báo cáo dừng máy
      machineReport.style.display = 'none';
      
      // Reset trạng thái chọn dừng máy
      window.machineStopStatusSelected = false;
      
      // Reset các trường trong báo cáo dừng máy
      const stopReason = document.getElementById('stopReason');
      const stopTimeInput = document.getElementById('stopTimeInput');
      const resumeTimeInput = document.getElementById('resumeTimeInput');
      const stopTimeButton = document.getElementById('stopTimeButton');
      const resumeTimeButton = document.getElementById('resumeTimeButton');
      const stopTimeDisplay = document.getElementById('stopTimeDisplay');
      const resumeTimeDisplay = document.getElementById('resumeTimeDisplay');
      const stopDuration = document.getElementById('stopDuration');
      const otherReason = document.getElementById('otherReason');
      
      if (stopReason) stopReason.selectedIndex = 0;
      if (stopTimeInput) stopTimeInput.value = '';
      if (resumeTimeInput) resumeTimeInput.value = '';
      if (stopTimeButton) stopTimeButton.style.display = 'block';
      if (resumeTimeButton) resumeTimeButton.style.display = 'block';
      if (stopTimeDisplay) stopTimeDisplay.textContent = '';
      if (resumeTimeDisplay) resumeTimeDisplay.textContent = '';
      if (stopDuration) stopDuration.value = '';
      if (otherReason) otherReason.value = '';
      
      // Ẩn các trường thời gian và trường bổ sung
      const timeInputs = document.querySelectorAll('.time-inputs');
      const additionalFields = document.querySelector('.additional-fields');
      
      if (timeInputs) {
        timeInputs.forEach(input => {
          input.style.display = 'none';
        });
      }
      
      if (additionalFields) additionalFields.style.display = 'none';
      
      // Xóa tất cả các lý do dừng máy bổ sung
      const additionalReasonsContainer = document.getElementById('additionalReasonsContainer');
      if (additionalReasonsContainer) {
        additionalReasonsContainer.innerHTML = '';
      }
      
      // Ẩn nút thêm lý do
      const addReasonSection = document.querySelector('.add-reason-section');
      if (addReasonSection) addReasonSection.style.display = 'none';
    }
    
    // Đặt lại giá trị Ca và người thực hiện
    const caElement = document.getElementById('ca');
    const nguoiElement = document.getElementById('nguoi');
    
    if (caElement) caElement.value = caValue;
    if (nguoiElement) nguoiElement.value = nguoiValue;
    
    // Ẩn thời gian bắt đầu
    const startTimeElement = document.getElementById('startTime');
    if (startTimeElement) startTimeElement.textContent = '';
    
    // Xóa dữ liệu thời gian đã lưu
    document.body.removeAttribute('data-start-time');
    document.body.removeAttribute('data-end-time');
    
    // Đặt lại trạng thái ban đầu cho nút Bắt Đầu
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
    if (startButton) startButton.disabled = false;
    
    // Cập nhật tiến độ
    if (typeof updateProgress === 'function') {
      updateProgress();
    }
    
    // Hiển thị thông báo
    if (typeof showNotification === 'function') {
      showNotification('Form đã được reset thành công!', 'success');
    } else {
      alert('Form đã được reset thành công!');
    }
  }
  
  // Thiết lập sự kiện khi trang web đã tải xong
  document.addEventListener('DOMContentLoaded', function() {
    // Tìm nút reset và gán sự kiện
    const resetButton = document.getElementById('btnResetForm');
    if (resetButton) {
      resetButton.addEventListener('click', resetForm);
    }
  });


//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG TÌM KIẾM PHIẾU SANG CUỘN
//  Mô tả: Tìm kiếm thông tin phiếu, hiển thị dữ liệu, xử lý kết quả
//! =================================================================

//todo Tìm kiếm thông tin phiếu sang cuộn (cải thiện)========================================================
async function searchPhieuSangCuon() {
  try {
      const soPhieu = document.getElementById('soPhieu').value.trim();
      const thuTu = document.getElementById('thuTu').value;

      console.log("Tìm kiếm phiếu:", soPhieu, "với thứ tự:", thuTu);

      if (!soPhieu) {
          console.log("Số phiếu trống, bỏ qua tìm kiếm");
          return;
      }

      // Hiển thị trạng thái đang tìm kiếm
      showLoadingState(true);

      // Lấy tất cả formula từ API
      const formulaList = await getFormulaData();
      
      // Lọc dữ liệu theo số phiếu
      const filteredList = formulaList.filter(item => {
          const itemSoPhieu = item.soPhieu ? item.soPhieu.trim() : '';
          return itemSoPhieu === soPhieu;
      });

      // Nếu không tìm thấy dữ liệu phiếu
      if (filteredList.length === 0) {
          // Lưu giá trị thứ tự hiện tại trước khi cập nhật dropdown
          const currentThuTu = thuTu;
          
          // LUÔN cập nhật danh sách thứ tự khi không có dữ liệu
          updateThuTuOptions([]);
          
          // Khôi phục giá trị thứ tự đã chọn nếu có
          if (currentThuTu && currentThuTu !== '-- Thứ tự --') {
              document.getElementById('thuTu').value = currentThuTu;
              console.log('Đã khôi phục thứ tự đã chọn:', currentThuTu);
          }
          
          // Reset dữ liệu trước khi đánh dấu là phiếu bổ sung sau
          resetFormFields();
          
          // Đánh dấu là người dùng đã chọn phiếu bổ sung sau
          document.body.setAttribute('data-need-formula-update', 'true');
          document.body.setAttribute('data-so-phieu', soPhieu);
          document.body.setAttribute('data-thu-tu', currentThuTu || thuTu);
          
          // Cho phép chọn vị trí ngay cả khi trường vị trí trống
          enablePositionSelects();
          
          // Cập nhật tiến độ - sẽ tính riêng cho phiếu bổ sung sau
          updateProgressForPendingFormula();
          
          showNotification(`Không tìm thấy thông tin phiếu ${soPhieu}. Bạn có thể nhập thủ công các thông tin cần thiết.`, 'info');
          return;
      }

      // Tìm phiếu theo thứ tự
      let selectedData;
      
      if (thuTu && thuTu !== '-- Thứ tự --') {
          // Tìm phiếu có phiếu phụ khớp với số phiếu + thứ tự
          const pscTT = soPhieu + thuTu;
          selectedData = filteredList.find(item => item.phieuPhu === pscTT);
          
          // Nếu không tìm thấy, thử tìm trực tiếp bằng STT
          if (!selectedData) {
              selectedData = filteredList.find(item => 
                  item.sttXuat && parseInt(item.sttXuat) === parseInt(thuTu)
              );
          }
          
          // Nếu vẫn không tìm thấy nhưng đã chọn thứ tự
          if (!selectedData) {
              // Lưu giá trị thứ tự hiện tại
              const currentThuTu = thuTu;
              
              // Reset dữ liệu trước khi đánh dấu
              resetFormFields();
              
              // Đánh dấu là phiếu bổ sung sau
              document.body.setAttribute('data-need-formula-update', 'true');
              document.body.setAttribute('data-so-phieu', soPhieu);
              document.body.setAttribute('data-thu-tu', currentThuTu);
              
              // Cho phép chọn vị trí
              enablePositionSelects();
              
              // Cập nhật tiến độ đặc biệt
              updateProgressForPendingFormula();
              
              showNotification(`Không tìm thấy thông tin phiếu ${soPhieu} với thứ tự ${currentThuTu}. Tiếp tục nhập thủ công.`, 'info');
              return;
          }
      } else {
          // Luôn cập nhật danh sách thứ tự trong dropdown (1-10 với tô màu)
          updateThuTuOptions(filteredList);
          
          if (filteredList.length === 1) {
              // Nếu chỉ có một phiếu, tự động chọn STT của phiếu đó
              const singlePhieu = filteredList[0];
              const sttValue = singlePhieu.sttXuat ? String(singlePhieu.sttXuat).trim() : '1';
              document.getElementById('thuTu').value = sttValue;
              
              // Tự động hiển thị dữ liệu
              selectedData = singlePhieu;
          } else {
              showNotification('Vui lòng chọn thứ tự phiếu', 'info');
              return;
          }
      }

      // Hiển thị dữ liệu lên form nếu có
      if (selectedData) {
          // Xóa đánh dấu phiếu bổ sung sau vì đã tìm thấy dữ liệu
          document.body.removeAttribute('data-need-formula-update');
          document.body.removeAttribute('data-so-phieu');
          document.body.removeAttribute('data-thu-tu');
          
          displayPhieuData(selectedData);
      }
  } catch (error) {
      console.error('Lỗi khi tìm kiếm phiếu sang cuộn:', error);
      showNotification(error.message, 'error');
  } finally {
      showLoadingState(false);
      updateProgress();
  }
}


// Thêm hàm mới để bật các select vị trí ngay cả khi trường vị trí trống
function enablePositionSelects() {
  const viTri1Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(1) input');
  const viTri2Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(2) input');
  const viTri3Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(3) input');
  
  const viTri1Select = document.getElementById('viTri1Select');
  const viTri2Select = document.getElementById('viTri2Select');
  const viTri3Select = document.getElementById('viTri3Select');
  
  // Chỉ bật các select khi đang xử lý phiếu bổ sung sau
  if (document.body.hasAttribute('data-need-formula-update')) {
      if (viTri1Select) viTri1Select.disabled = false;
      if (viTri2Select) viTri2Select.disabled = false;
      if (viTri3Select) viTri3Select.disabled = false;
      
      // Kích hoạt sự kiện change để cập nhật tiến độ
      if (viTri1Select) viTri1Select.dispatchEvent(new Event('change'));
  }
}



// Cập nhật danh sách thứ tự trong dropdown dựa trên các phiếu tìm thấy
// Hàm cập nhật danh sách thứ tự trong dropdown dựa trên các phiếu tìm thấy
// Cập nhật danh sách thứ tự trong dropdown dựa trên các phiếu tìm thấy
// Hàm cập nhật danh sách thứ tự trong dropdown dựa trên các phiếu tìm thấy
function updateThuTuOptions(phieuList) {
  const thuTuSelect = document.getElementById('thuTu');
  if (!thuTuSelect) return;

  console.log("Đang cập nhật danh sách thứ tự từ phiếu:", phieuList);

  // Xóa tất cả các option cũ (ngoại trừ option đầu tiên)
  while (thuTuSelect.options.length > 1) {
      thuTuSelect.remove(1);
  }

  // Tạo một Set để lưu trữ các thứ tự có dữ liệu thực tế
  const existingThuTu = new Set();

  // Thu thập các thứ tự có dữ liệu từ phiếu (chỉ khi có phiếu)
  if (phieuList && phieuList.length > 0) {
      phieuList.forEach(phieu => {
          // Ưu tiên sử dụng sttXuat nếu có
          if (phieu.sttXuat && phieu.sttXuat !== '') {
              existingThuTu.add(String(phieu.sttXuat).trim());
          }
          // Nếu không có sttXuat, thử dùng các trường khác để xác định
          else if (phieu.phieuPhu && phieu.soPhieu) {
              // Lấy phần cuối của phieuPhu làm STT (ví dụ: PSC001A -> A, PSC0011 -> 1)
              const phieuPhuStr = String(phieu.phieuPhu);
              const soPhieuStr = String(phieu.soPhieu);
              if (phieuPhuStr.startsWith(soPhieuStr)) {
                  const sttPart = phieuPhuStr.substring(soPhieuStr.length);
                  if (sttPart && !isNaN(sttPart)) {
                      existingThuTu.add(sttPart);
                  }
              }
          }
      });
  }

  console.log("Các thứ tự có dữ liệu:", [...existingThuTu]);
  
  // LUÔN thêm các STT từ 1 đến 10 (bất kể có phiếu hay không)
  for (let i = 1; i <= 10; i++) {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = String(i);
      
      // Nếu STT này có dữ liệu thực tế, tô màu chữ
      if (existingThuTu.has(String(i))) {
          option.style.color = '#0066cc'; // Màu xanh cho STT có dữ liệu
          option.style.fontWeight = 'bold';
      } else {
          option.style.color = '#666666'; // Màu xám cho STT không có dữ liệu
          option.style.fontStyle = 'italic';
      }
      
      thuTuSelect.appendChild(option);
  }

  // Xử lý tự động chọn STT - CHỈ focus, KHÔNG tự động chọn và kích hoạt sự kiện
  if (existingThuTu.size >= 1) {
      // Nếu có STT có dữ liệu, chỉ focus vào dropdown để người dùng chọn
      thuTuSelect.focus();
      console.log(`Có ${existingThuTu.size} STT có dữ liệu, focus vào dropdown để người dùng chọn`);
  } else {
      // Nếu không có STT nào có dữ liệu (phiếu bổ sung sau hoàn toàn mới)
      // Không tự động chọn gì cả, để người dùng tự chọn từ 1-10
      console.log("Không có STT nào có dữ liệu, hiển thị 1-10 để người dùng chọn");
      
      // Focus vào dropdown để người dùng biết cần chọn
      thuTuSelect.focus();
  }
}


//todo Lấy dữ liệu formula từ API (cải thiện)========================================================
async function getFormulaData() {
    try {
        // Hiển thị hộp thoại "Đang tìm kiếm..." nếu cần
        console.log('Đang lấy dữ liệu formula từ API...');

        // Gọi API của module phiếu sang cuộn - đổi sang endpoint formula
        const response = await fetch('/api/sang-cuon/formula');
        if (!response.ok) {
            // Nếu endpoint formula không tồn tại, thử lại với endpoint list
            console.log('Endpoint formula không có sẵn, thử với endpoint list...');
            const fallbackResponse = await fetch('/api/sang-cuon/list');

            if (!fallbackResponse.ok) {
                const errorText = await fallbackResponse.text();
                console.error('API trả về lỗi:', errorText);
                throw new Error('Không thể lấy thông tin phiếu sang cuộn');
            }

            const listData = await fallbackResponse.json();
            console.log('Tổng số phiếu sang cuộn từ list:', listData.length);
            return listData;
        }

        const formulaList = await response.json();
        console.log('Tổng số phiếu sang cuộn formula:', formulaList.length);

        // Thêm một số xử lý để chuẩn hóa dữ liệu
        return formulaList.map(formula => {
            // Đảm bảo các trường quan trọng luôn có giá trị
            return {
                ...formula,
                soPhieu: formula.soPhieu || '',
                phieu: formula.phieu || '',
                phieuPhu: formula.phieuPhu || '',
                khoCanSang: formula.khoCanSang || formula.tongKhoNhap || '',
                kho: formula.kho || formula.dlXuat || ''
            };
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu formula:', error);
        throw error;
    }
}

//todo Hiển thị dữ liệu phiếu lên form (cải thiện)========================================================
function displayPhieuData(data) {
  try {
      console.log('Hiển thị dữ liệu phiếu:', data);

      // Hàm tìm giá trị từ nhiều trường có thể có
      const findValueFromFields = (fieldNames) => {
          for (const fieldName of fieldNames) {
              if (data[fieldName] !== undefined && data[fieldName] !== null && data[fieldName] !== '') {
                  return data[fieldName];
              }
          }
          return '';
      };

      // Hiển thị thông tin worksheet
      const wsValue = findValueFromFields(['ws', 'WS', 'worksheet', 'WORKSHEET']);
      document.getElementById('ws').value = wsValue;

      // Hiển thị thông tin khách hàng (ưu tiên mã KH)
      const khachHangElement = document.getElementById('khachHang');
      if (khachHangElement) {
          khachHangElement.value = data.maKH && data.maKH !== '' ? data.maKH : data.khachHang;
      }

      // Hiển thị thông tin mã vật tư
      const maVatTuElement = document.getElementById('maVatTu');
      if (maVatTuElement) {
          maVatTuElement.value = data.mhkx || '';
          
          // SỬA: Xử lý khổ từ mã vật tư (GCKGSG-0120-2200-0000 -> lấy 2200, loại bỏ số 0 đầu)
          if (data.mhkx) {
              const parts = data.mhkx.split('-');
              if (parts.length >= 3) {
                  const rawKho = parts[2]; // Ví dụ: "0950"
                  const khoFromMaVatTu = parseInt(rawKho, 10).toString(); // Chuyển "0950" thành "950"
                  
                  // Cập nhật khổ sản phẩm
                  const khoSanPhamElement = document.getElementById('khoSanPham');
                  if (khoSanPhamElement) {
                      khoSanPhamElement.value = khoFromMaVatTu;
                  }
              }
          }
      }

      // Hiển thị thông tin định lượng
      const dinhLuongElement = document.getElementById('dinhLuong');
      if (dinhLuongElement) {
          dinhLuongElement.value = data.dinhLuong || data.dlXuat || '';
      }

      // Hiển thị thông tin khổ cần sang
      const khoCanSangElement = document.getElementById('khoCanSang');
      if (khoCanSangElement) {
          // Tìm giá trị khổ cần sang từ nhiều trường có thể có
          const khoCanSangValue = findValueFromFields(['khoCanSang', 'tongKhoNhap', 'kho']);
          khoCanSangElement.value = khoCanSangValue;
          
          // Phân tích khổ cần sang và đặt vào các vị trí
          setKhoPositions(khoCanSangValue);
      }

      // Cập nhật tiến độ sau khi hiển thị dữ liệu
      updateProgress();

      // Hiển thị thông báo thành công
      showNotification('Đã tìm thấy và hiển thị thông tin phiếu', 'success');

  } catch (error) {
      console.error('Lỗi khi hiển thị dữ liệu phiếu:', error);
      showNotification('Lỗi khi hiển thị dữ liệu phiếu: ' + error.message, 'error');
  }
}


//todo Đặt giá trị các vị trí khổ từ khổ cần sang========================================================
function setKhoPositions(khoCanSang) {
  // Nếu không có khổ cần sang, không làm gì
  if (!khoCanSang) return;

  // SỬA: Chia khổ cần sang dựa vào dấu "+" và xử lý loại bỏ số 0 đầu
  const khoArray = khoCanSang.split('+').map(k => {
      const trimmed = k.trim();
      // Loại bỏ số 0 đầu nếu có
      return trimmed ? parseInt(trimmed, 10).toString() : trimmed;
  });

  // Lấy các ô input vị trí và các select tương ứng
  const viTri1 = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(1) input');
  const viTri2 = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(2) input');
  const viTri3 = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(3) input');

  const viTriSelect1 = document.getElementById('viTri1Select');
  const viTriSelect2 = document.getElementById('viTri2Select');
  const viTriSelect3 = document.getElementById('viTri3Select');

  // Đặt giá trị cho các vị trí
  if (khoArray.length >= 1 && viTri1) {
      viTri1.value = khoArray[0];
  }

  if (khoArray.length >= 2 && viTri2) {
      viTri2.value = khoArray[1];
  } else if (viTri2) {
      viTri2.style.opacity = "0.5";
  }

  if (khoArray.length >= 3 && viTri3) {
      viTri3.value = khoArray[2];
  } else if (viTri3) {
      viTri3.style.opacity = "0.5";
  }

  // Vô hiệu hóa các select dựa trên giá trị input, trừ khi là phiếu bổ sung sau
  const isPendingFormula = document.body.hasAttribute('data-need-formula-update');
  
  if (!isPendingFormula) {
      if (viTriSelect1) viTriSelect1.disabled = !viTri1.value;
      if (viTriSelect2) viTriSelect2.disabled = !viTri2.value;
      if (viTriSelect3) viTriSelect3.disabled = !viTri3.value;
  } else {
      // Phiếu bổ sung sau - không vô hiệu hóa select
      if (viTriSelect1) viTriSelect1.disabled = false;
      if (viTriSelect2) viTriSelect2.disabled = false;
      if (viTriSelect3) viTriSelect3.disabled = false;
  }

  // SỬA: Hiển thị khổ trong phần kết thúc báo cáo - điền đúng giá trị khổ đã xử lý
  const khoViTri1 = document.querySelector('.row .col-6:first-child input:nth-child(1)');
  const khoViTri2 = document.querySelector('.row .col-6:first-child input:nth-child(2)');
  const khoViTri3 = document.querySelector('.row .col-6:first-child input:nth-child(3)');

  if (khoViTri1) khoViTri1.value = khoArray.length >= 1 ? khoArray[0] : '';
  if (khoViTri2) khoViTri2.value = khoArray.length >= 2 ? khoArray[1] : '';
  if (khoViTri3) khoViTri3.value = khoArray.length >= 3 ? khoArray[2] : '';

  // Cập nhật select state
  if (typeof updateSelectState === 'function') {
      updateSelectState();
  } else {
      // Nếu hàm chưa tồn tại, tạo sự kiện để kích hoạt sau khi trang đã tải xong
      document.dispatchEvent(new CustomEvent('updateSelectState'));
  }

  console.log(`Đã đặt giá trị vị trí từ khổ cần sang: ${khoCanSang} -> [${khoArray.join(', ')}]`);
}


// Thêm hàm mới để cập nhật vị trí trong phần báo cáo khi chọn select vị trí
function updateReportPositions() {
  const viTriSelect1 = document.getElementById('viTri1Select');
  const viTriSelect2 = document.getElementById('viTri2Select');
  const viTriSelect3 = document.getElementById('viTri3Select');
  
  // Lấy các input vị trí trong phần báo cáo (phần kết thúc)
  const reportViTri1 = document.querySelector('.row .col-6:first-child .d-flex.gap-2.mb-3 input:nth-child(1)');
  const reportViTri2 = document.querySelector('.row .col-6:first-child .d-flex.gap-2.mb-3 input:nth-child(2)');
  const reportViTri3 = document.querySelector('.row .col-6:first-child .d-flex.gap-2.mb-3 input:nth-child(3)');
  
  // Tìm các input vị trí theo cách khác nếu không tìm thấy
  const allViTriInputs = document.querySelectorAll('.row .col-6:first-child input[placeholder*="Vị trí"], .row .col-6:first-child input[id*="vitri"], .row .col-6:first-child .d-flex input');
  
  // Cập nhật vị trí dựa trên select đã chọn
  if (viTriSelect1 && viTriSelect1.value) {
      if (reportViTri1) {
          reportViTri1.setAttribute('data-position', viTriSelect1.value);
          reportViTri1.setAttribute('title', `Vị trí ${viTriSelect1.value}`);
      } else if (allViTriInputs[0]) {
          allViTriInputs[0].setAttribute('data-position', viTriSelect1.value);
          allViTriInputs[0].setAttribute('title', `Vị trí ${viTriSelect1.value}`);
      }
  }
  
  if (viTriSelect2 && viTriSelect2.value) {
      if (reportViTri2) {
          reportViTri2.setAttribute('data-position', viTriSelect2.value);
          reportViTri2.setAttribute('title', `Vị trí ${viTriSelect2.value}`);
      } else if (allViTriInputs[1]) {
          allViTriInputs[1].setAttribute('data-position', viTriSelect2.value);
          allViTriInputs[1].setAttribute('title', `Vị trí ${viTriSelect2.value}`);
      }
  }
  
  if (viTriSelect3 && viTriSelect3.value) {
      if (reportViTri3) {
          reportViTri3.setAttribute('data-position', viTriSelect3.value);
          reportViTri3.setAttribute('title', `Vị trí ${viTriSelect3.value}`);
      } else if (allViTriInputs[2]) {
          allViTriInputs[2].setAttribute('data-position', viTriSelect3.value);
          allViTriInputs[2].setAttribute('title', `Vị trí ${viTriSelect3.value}`);
      }
  }
}


//todo Đặt lại các trường form khi không tìm thấy dữ liệu========================================================
function resetFormFields() {
    // Đặt lại các trường thông tin
    const wsElement = document.getElementById('ws');
    const khachHangElement = document.getElementById('khachHang');
    const maVatTuElement = document.getElementById('maVatTu');
    const khoCanSangElement = document.getElementById('khoCanSang');
    const khoSanPhamElement = document.getElementById('khoSanPham');

    if (wsElement) wsElement.value = '';
    if (khachHangElement) khachHangElement.value = '';
    if (maVatTuElement) maVatTuElement.value = '';
    if (khoCanSangElement) khoCanSangElement.value = '';
    if (khoSanPhamElement) khoSanPhamElement.value = '';

    // Đặt lại các vị trí khổ
    const viTriElements = document.querySelectorAll('.row.g-2.mb-4 .col-md-4 input');
    viTriElements.forEach(el => {
        el.value = '';
    });

    // Đặt lại các vị trí khổ ở phần kết thúc báo cáo
    const khoViTriElements = document.querySelectorAll('.row .col-6:first-child input');
    khoViTriElements.forEach(el => {
        el.value = '';
    });
}

//todo Hiển thị trạng thái đang tải========================================================
function showLoadingState(isLoading) {
    // Triển khai nếu cần
    // Ví dụ: hiển thị spinner, disable các nút, v.v.

    // Nếu đang tải, disable các nút
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
    const confirmButton = document.querySelector('.btn.btn-primary');

    if (startButton) startButton.disabled = isLoading;
    if (confirmButton) confirmButton.disabled = isLoading;
}

//todo Hiển thị thông báo (cải thiện)========================================================
function showNotification(message, type = 'info') {
    // Định nghĩa màu theo loại thông báo
    const colors = {
        'info': '#2196F3',
        'success': '#4CAF50',
        'warning': '#FF9800',
        'error': '#F44336'
    };

    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.marginRight = '0 auto';
    notification.style.top = '20px';
    notification.style.left = '20px';
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    notification.textContent = message;

    // Thêm vào body
    document.body.appendChild(notification);

    // Hiển thị với animation
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 900);
}

// Hàm lấy màu theo loại thông báo
function getNotificationColor(type) {
    switch (type) {
        case 'success':
            return '#4CAF50';
        case 'error':
            return '#F44336';
        case 'warning':
            return '#FF9800';
        case 'info':
        default:
            return '#2196F3';
    }
}


//todo Hàm thiết lập sự kiện cho select mã số cuộn=============================================================================
function setupMaSoCuonSelect() {
    const maSoCuonSelect = document.getElementById('maSoCuonSelect');
    const maSoCuonInputContainer = document.getElementById('maSoCuonInputContainer');
    const maSoCuonInput = document.getElementById('maSoCuon');
    
    if (!maSoCuonSelect || !maSoCuonInputContainer || !maSoCuonInput) {
      console.error('Không tìm thấy các phần tử cần thiết cho mã số cuộn');
      return;
    }
    
    // Sự kiện khi thay đổi lựa chọn
    maSoCuonSelect.addEventListener('change', function() {
      const selectedValue = this.value;
      
      if (selectedValue === 'nhap') {
        // Nếu chọn "Nhập mã số cuộn...", hiển thị ô input
        maSoCuonInputContainer.style.display = 'block';
        maSoCuonInput.value = '';
        maSoCuonInput.focus();
      } else if (selectedValue === 'TƯƠNG TỰ CUỘN TRÊN') {
        // Nếu chọn "TƯƠNG TỰ CUỘN TRÊN", tìm mã số cuộn từ phiếu trước
        maSoCuonInputContainer.style.display = 'none';
        handleSimilarRollOption();
      } else {
        // Nếu chọn các lựa chọn khác, ẩn ô input và sử dụng giá trị đã chọn
        maSoCuonInputContainer.style.display = 'none';
        maSoCuonInput.value = selectedValue;
        
        // Cập nhật tiến độ
        updateProgress();
      }
    });
    
    // Sự kiện khi nhập liệu vào ô input
    maSoCuonInput.addEventListener('input', function() {
      // Cập nhật tiến độ khi có thay đổi
      updateProgress();
    });
    
    // Sự kiện khi nhập xong (blur)
    maSoCuonInput.addEventListener('blur', function() {
      // Kiểm tra nếu đã nhập giá trị thì cập nhật tiến độ
      if (this.value.trim()) {
        updateProgress();
      }
    });
    
    console.log('Đã thiết lập sự kiện cho mã số cuộn');
  }

//todo Lấy giá trị mã số cuộn chính xác=============================================================================
function getMaSoCuonValue() {
    const maSoCuonSelect = document.getElementById('maSoCuonSelect');
    const maSoCuonInput = document.getElementById('maSoCuon');
    
    if (!maSoCuonSelect || !maSoCuonInput) {
      return '';
    }
    
    // Luôn lấy giá trị từ ô input, vì chúng ta đã xử lý tất cả các trường hợp
    // và đặt giá trị thích hợp vào ô input
    return maSoCuonInput.value.trim();
  }
  

  //todo Hàm lấy mã số cuộn từ phiếu báo cáo trước đó=============================================================================
  async function getPreviousRollCode() {
    try {
      // Lấy số phiếu hiện tại
      const currentPhieu = document.getElementById('soPhieu').value.trim();
      const currentThuTu = document.getElementById('thuTu').value;
      
      if (!currentPhieu) {
        showNotification('Vui lòng nhập số phiếu trước', 'warning');
        return null;
      }
      
      console.log('Đang tìm mã số cuộn từ phiếu trước của:', currentPhieu, 'với thứ tự:', currentThuTu);
      
      // Gọi API để lấy danh sách báo cáo
      const response = await fetch('/api/bao-cao-scl/list');
      if (!response.ok) {
        throw new Error('Không thể tải danh sách báo cáo để tìm phiếu trước');
      }
      
      const reportList = await response.json();
      
      // Sắp xếp theo STT giảm dần (để phiếu mới nhất lên đầu)
      reportList.sort((a, b) => {
        return parseInt(b.stt || 0) - parseInt(a.stt || 0);
      });
      
      console.log(`Đã tải ${reportList.length} báo cáo để tìm phiếu trước`);
      
      // Tìm phiếu có cùng số phiếu và STT cao nhất nhưng nhỏ hơn báo cáo hiện tại
      let previousReport = null;
      
      // Trường hợp 1: Nếu có thứ tự, thì tìm phiếu có cùng số phiếu nhưng thứ tự liền trước
      if (currentThuTu && currentThuTu !== '-- Thứ tự --') {
        const currentThuTuNum = parseInt(currentThuTu);
        if (!isNaN(currentThuTuNum) && currentThuTuNum > 1) {
          // Tìm phiếu có cùng số phiếu và thứ tự liền trước
          previousReport = reportList.find(report => 
            report.so_phieu === currentPhieu && 
            (report.thu_tu_cuon === String(currentThuTuNum - 1) || parseInt(report.so_lan) === currentThuTuNum - 1)
          );
          
          console.log('Tìm theo thứ tự liền trước:', previousReport);
        }
      }
      
      // Trường hợp 2: Nếu không tìm thấy hoặc không có thứ tự, tìm phiếu có STT cao nhất của cùng số phiếu
      if (!previousReport) {
        previousReport = reportList.find(report => report.so_phieu === currentPhieu);
        console.log('Tìm theo STT cao nhất:', previousReport);
      }
      
      // Trường hợp 3: Nếu vẫn không tìm thấy, tìm phiếu có STT cao nhất (bất kỳ số phiếu nào)
      if (!previousReport && reportList.length > 0) {
        previousReport = reportList[0]; // Phiếu có STT cao nhất
        console.log('Tìm theo STT tổng:', previousReport);
      }
      
      if (previousReport) {
        console.log('Đã tìm thấy phiếu trước:', previousReport);
        
        // Trả về giá trị mã số cuộn hoặc tùy chọn đặc biệt
        const maSoCuon = previousReport.ma_so_cuon || '';
        
        // Nếu mã số cuộn là một trong các giá trị đặc biệt, trả về đúng giá trị đặc biệt đó
        if (maSoCuon === 'GIẤY KH CUNG CẤP' || maSoCuon === 'KHÔNG CÓ MÃ SỐ CUỘN') {
          // Thêm phần này để đảm bảo trả về đúng giá trị đặc biệt
          return maSoCuon;
        }
        
        return maSoCuon;
      } else {
        console.log('Không tìm thấy phiếu trước');
        return null;
      }
      
    } catch (error) {
      console.error('Lỗi khi lấy mã số cuộn từ phiếu trước:', error);
      showNotification('Lỗi khi lấy mã số cuộn từ phiếu trước: ' + error.message, 'error');
      return null;
    }
  }
  
  //todo Hàm xử lý khi chọn "TƯƠNG TỰ CUỘN TRÊN"=============================================================================
  async function handleSimilarRollOption() {
    // Hiển thị trạng thái đang tải
    showNotification('Đang tìm mã số cuộn từ phiếu trước...', 'info');
    
    // Lấy mã số cuộn từ phiếu trước
    const previousCode = await getPreviousRollCode();
    
    // Lấy các element cần thiết
    const maSoCuonInput = document.getElementById('maSoCuon');
    const maSoCuonSelect = document.getElementById('maSoCuonSelect');
    
    if (previousCode) {
      // Xử lý đặc biệt cho các giá trị đặc biệt
      if (previousCode === 'GIẤY KH CUNG CẤP' || previousCode === 'KHÔNG CÓ MÃ SỐ CUỘN') {
        // Đối với các giá trị đặc biệt, chọn lại giá trị tương ứng trong dropdown
        if (maSoCuonSelect) {
          maSoCuonSelect.value = previousCode;
          
          // Kích hoạt sự kiện change để cập nhật các trường khác
          const event = new Event('change', { bubbles: true });
          maSoCuonSelect.dispatchEvent(event);
        }
      } else {
        // Đối với mã số cuộn thông thường, đặt giá trị vào input
        if (maSoCuonInput) {
          maSoCuonInput.value = previousCode;
        }
        
        // Giữ nguyên hiển thị "TƯƠNG TỰ CUỘN TRÊN" trong dropdown
      }
      
      showNotification(`Đã lấy mã số cuộn từ phiếu trước: ${previousCode}`, 'success');
      
      // Cập nhật tiến độ
      if (typeof updateProgress === 'function') {
        updateProgress();
      }
    } else {
      showNotification('Không tìm thấy mã số cuộn từ phiếu trước', 'warning');
      
      // Nếu không tìm thấy, có thể đặt lại dropdown về giá trị mặc định
      if (maSoCuonSelect) {
        maSoCuonSelect.selectedIndex = 0;
      }
    }
  }

//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG QUẢN LÝ DỪNG MÁY
//  Mô tả: Xử lý các sự kiện liên quan đến báo cáo dừng máy
//! =================================================================

// Biến lưu trữ trạng thái
let reasonCount = 1; // Đếm số lý do
let machineStopStatusSelected = false;

// Các đối tượng DOM cho dừng máy
const btnYes = document.getElementById('btnYes');
const btnNo = document.getElementById('btnNo');
const machineReport = document.getElementById('machineReport');
const stopReason = document.getElementById('stopReason');
const timeInputs = document.querySelectorAll('.time-inputs');
const additionalFields = document.querySelector('.additional-fields');
const addReasonSection = document.querySelector('.add-reason-section');
const addReasonBtn = document.getElementById('addReasonBtn');
const additionalReasonsContainer = document.getElementById('additionalReasonsContainer');
const deleteReasonBtn = document.getElementById('deleteReasonBtn');

const stopTimeInput = document.getElementById('stopTimeInput');
const resumeTimeInput = document.getElementById('resumeTimeInput');
const stopTimeButton = document.getElementById('stopTimeButton');
const resumeTimeButton = document.getElementById('resumeTimeButton');
const stopTimeDisplay = document.getElementById('stopTimeDisplay');
const resumeTimeDisplay = document.getElementById('resumeTimeDisplay');
const stopDuration = document.getElementById('stopDuration');

// Đặt trạng thái ban đầu là không chọn gì cả
if (btnNo) {
    btnNo.style.backgroundColor = '';
    btnNo.style.color = '';
  }
  
  if (btnYes) {
    btnYes.style.backgroundColor = '';
    btnYes.style.color = '';
  }
  
// Thiết lập sự kiện dừng máy
if (btnYes) {
    btnYes.addEventListener('click', function() {
      // Cập nhật trạng thái và giao diện
      machineReport.style.display = 'block';
      btnYes.style.backgroundColor = '#d00000';
      btnYes.style.color = 'white';
      btnNo.style.backgroundColor = '#ccc';
      
      // Đánh dấu đã chọn
      machineStopStatusSelected = true;
      console.log('Đã chọn CÓ dừng máy');
      
      updateProgress();
    });
  }

  if (btnNo) {
    btnNo.addEventListener('click', function() {
      // Cập nhật trạng thái và giao diện
      machineReport.style.display = 'none';
      btnNo.style.backgroundColor = '#4a90e2';
      btnYes.style.backgroundColor = 'white';
      btnYes.style.color = 'black';
      
      // Đánh dấu đã chọn
      machineStopStatusSelected = true;
      console.log('Đã chọn KHÔNG dừng máy');
      
      updateProgress();
    });
  }

  // Đặt trạng thái ban đầu là chưa chọn
  machineStopStatusSelected = false;

// Hiển thị các trường thời gian khi chọn lý do dừng máy
if (stopReason) {
    stopReason.addEventListener('change', function () {
        if (this.value) {
            timeInputs.forEach(input => {
                input.style.display = 'block';
            });
            if (additionalFields) additionalFields.style.display = 'flex';
        } else {
            timeInputs.forEach(input => {
                input.style.display = 'none';
            });
            if (additionalFields) additionalFields.style.display = 'none';
        }
        updateProgress();
    });
}

// Xử lý nút thời gian dừng máy
if (stopTimeButton) {
    stopTimeButton.addEventListener('click', function () {
        const now = new Date();
        const formattedDateTime = formatDateTimeForInput(now);
        stopTimeInput.value = formattedDateTime;
        stopTimeButton.style.display = 'none';
        stopTimeDisplay.textContent = formatDisplayTime(now);
        calculateDuration();
        // windown.checkShowAddReasonButton();
        updateProgress();
    });
}

// Xử lý nút thời gian chạy lại
if (resumeTimeButton) {
    resumeTimeButton.addEventListener('click', function () {
        const now = new Date();
        const formattedDateTime = formatDateTimeForInput(now);
        resumeTimeInput.value = formattedDateTime;
        resumeTimeButton.style.display = 'none';
        resumeTimeDisplay.textContent = formatDisplayTime(now);
        calculateDuration();
        // windown.checkShowAddReasonButton();
        updateProgress();
    });
}

// Xử lý thay đổi thời gian thủ công
if (stopTimeInput) {
    stopTimeInput.addEventListener('change', function () {
        if (stopTimeButton) stopTimeButton.style.display = 'none';
        if (stopTimeDisplay) stopTimeDisplay.textContent = formatDisplayTime(new Date(this.value));
        calculateDuration();
        // windown.checkShowAddReasonButton();
        updateProgress();
    });
}

if (resumeTimeInput) {
    resumeTimeInput.addEventListener('change', function () {
        if (resumeTimeButton) resumeTimeButton.style.display = 'none';
        if (resumeTimeDisplay) resumeTimeDisplay.textContent = formatDisplayTime(new Date(this.value));
        calculateDuration();
        // windown.checkShowAddReasonButton();
        updateProgress();
    });
}

// Kiểm tra và hiển thị nút thêm lý do mới
// function checkShowAddReasonButton() {
//     const stopTimeInput = document.getElementById('stopTimeInput');
//     const resumeTimeInput = document.getElementById('resumeTimeInput');
//     const addReasonSection = document.querySelector('.add-reason-section');
    
//     if (stopTimeInput && resumeTimeInput && addReasonSection) {
//         // Nếu cả hai ô thời gian đều có giá trị, hiển thị nút thêm lý do
//         if (stopTimeInput.value && resumeTimeInput.value) {
//             addReasonSection.style.display = 'block';
//         } else {
//             addReasonSection.style.display = 'none';
//         }
//     }
// }

// Xử lý nút thêm lý do mới
if (addReasonBtn) {
    // Xóa tất cả event listener cũ
    const newAddReasonBtn = document.createElement('button');
    
    // Sao chép các thuộc tính
    for (let i = 0; i < addReasonBtn.attributes.length; i++) {
        const attr = addReasonBtn.attributes[i];
        newAddReasonBtn.setAttribute(attr.name, attr.value);
    }
    
    // Sao chép nội dung và style
    newAddReasonBtn.innerHTML = addReasonBtn.innerHTML;
    newAddReasonBtn.className = addReasonBtn.className;
    newAddReasonBtn.id = 'addReasonBtn';
    
    // Gán sự kiện click trực tiếp
    newAddReasonBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Tăng biến đếm lý do
        window.reasonCount = (window.reasonCount || 1) + 1;
        const newReasonId = `reason-${window.reasonCount}`;
        
        // Tạo HTML cho lý do mới
        const newReasonHtml = `
          <div class="stop-reason-container" id="${newReasonId}">
          <hr>
          <div class="row mb-3">
              <div class="col-4">
              <label class="fw-bold mb-1">Lý do dừng máy</label>
              <select class="form-select" id="stopReason">
                <option value>-- Lý do --</option>
                <option value="Máy hư">F1 : Máy hư</option>
                <option value="Chờ giấy">F2 : Chờ giấy</option>
                <option value="Chờ tiếp thị">F3 : Bảo trì định kỳ</option>
                <option value="Chờ kế hoạch">F4 : Chờ kế hoạch</option>
                <option value="Vệ sinh">F5 : Vệ sinh</option>
                <option value="Khác">F6 : Khác</option>
                <option value="Bảo dưỡng">F7 : Bảo dưỡng</option>
                <option value="Sửa kẽm">F8 : Sửa kẽm</option>
                <option value="Thay su">F9 : Thay su</option>
                <option value="CHỜ KHÁCH TỚI KÝ BÀI">F10 : CHỜ KHÁCH TỚI KÝ BÀI</option>
                <option value="Cắt bảng DB">F11 : Cắt bảng DB</option>
                <option value="Giải lao">F12 : Giải lao</option>
                <option value="Cúp điện">F13 : Cúp điện</option>
              </select>
              </div>
              
              <div class="col-4 time-inputs-${window.reasonCount}" style="display: none;">
              <label class="fw-bold mb-1">Thời gian dừng máy</label>
              <div class="position-relative">
                  <input type="datetime-local" class="form-control stop-time-input">
                  <button class="btn btn-primary position-absolute top-0 end-0 h-100 stop-time-button" style="z-index: 10;">
                  Dừng máy
                  </button>
              </div>
              <div class="form-text stop-time-display"></div>
              </div>
              
              <div class="col-4 time-inputs-${window.reasonCount}" style="display: none;">
              <label class="fw-bold mb-1">Thời gian chạy lại</label>
              <div class="position-relative">
                  <input type="datetime-local" class="form-control resume-time-input">
                  <button class="btn btn-success position-absolute top-0 end-0 h-100 resume-time-button" style="z-index: 10;">
                  Chạy lại
                  </button>
              </div>
              <div class="form-text resume-time-display"></div>
              </div>
          </div>
          
          <div class="row mb-3 additional-fields-${window.reasonCount}" style="display: none;">
              <div class="col-8">
              <label class="fw-bold mb-1">Lý do khác</label>
              <input type="text" class="form-control" placeholder="Nhập lý do...">
              </div>
              <div class="col-4">
              <label class="fw-bold mb-1 text-primary">Thời gian dừng máy</label>
              <input type="text" class="form-control bg-light stop-duration" readonly>
              </div>
          </div>
          
          <div class="d-flex justify-content-end mb-3">
              <button class="btn btn-danger delete-reason-btn" data-reason-id="${newReasonId}">
              <i class="bi bi-trash">🗑️</i>
              </button>
          </div>
          </div>
      `;
        
        // Tìm container để thêm vào
        const additionalReasonsContainer = document.getElementById('additionalReasonsContainer');
        if (additionalReasonsContainer) {
            additionalReasonsContainer.insertAdjacentHTML('beforeend', newReasonHtml);
            
            // Thiết lập sự kiện cho lý do mới
            setupNewReasonEvents(newReasonId);
        }
        
        // Cập nhật tiến độ nếu cần
        if (typeof updateProgress === 'function') {
            updateProgress();
        }
        
        return false;
    };
    
    // Thay thế nút cũ bằng nút mới
    if (addReasonBtn.parentNode) {
        addReasonBtn.parentNode.replaceChild(newAddReasonBtn, addReasonBtn);
    }
}

// Hàm để hiển thị/ẩn nút thêm lý do
// window.checkShowAddReasonButton = function() {
//     const stopTimeInput = document.getElementById('stopTimeInput');
//     const resumeTimeInput = document.getElementById('resumeTimeInput');
//     const addReasonSection = document.querySelector('.add-reason-section');
    
//     if (stopTimeInput && resumeTimeInput && addReasonSection) {
//         // Nếu cả hai ô thời gian đều có giá trị, hiển thị nút thêm lý do
//         if (stopTimeInput.value && resumeTimeInput.value) {
//             addReasonSection.style.display = 'block';
//         } else {
//             addReasonSection.style.display = 'none';
//         }
//     }
// };

// Kiểm tra ngay khi trang tải xong
// window.checkShowAddReasonButton();

// Thiết lập các event listener cho lý do mới được thêm vào
function setupNewReasonEvents(reasonId) {
    const container = document.getElementById(reasonId);
    if (!container) return;
  
    // Tìm các phần tử cần thiết
    const reasonSelect = container.querySelector('.stop-reason-select') || 
                         container.querySelector('select');
    const timeInputs = container.querySelectorAll(`[class*="time-inputs"]`);
    const additionalFields = container.querySelector(`[class*="additional-fields"]`);
    const stopTimeInput = container.querySelector('.stop-time-input');
    const resumeTimeInput = container.querySelector('.resume-time-input');
    const stopTimeButton = container.querySelector('.stop-time-button');
    const resumeTimeButton = container.querySelector('.resume-time-button');
    const stopTimeDisplay = container.querySelector('.stop-time-display');
    const resumeTimeDisplay = container.querySelector('.resume-time-display');
    const stopDuration = container.querySelector('.stop-duration');
    const deleteButton = container.querySelector('.delete-reason-btn');
  
    // Sự kiện chọn lý do
    if (reasonSelect) {
      reasonSelect.addEventListener('change', function() {
        if (this.value) {
          timeInputs.forEach(input => {
            input.style.display = 'block';
          });
          if (additionalFields) additionalFields.style.display = 'flex';
        } else {
          timeInputs.forEach(input => {
            input.style.display = 'none';
          });
          if (additionalFields) additionalFields.style.display = 'none';
        }
        
        // Cập nhật tiến độ nếu cần
        if (typeof updateProgress === 'function') {
          updateProgress();
        }
      });
    }
  
    // SỬA NÚT DỪNG MÁY - Sử dụng onclick thay vì addEventListener
    if (stopTimeButton) {
      stopTimeButton.onclick = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        const now = new Date();
        const formattedDateTime = formatDateTimeForInput(now);
        if (stopTimeInput) {
          stopTimeInput.value = formattedDateTime;
        }
        
        // Ẩn nút ngay lập tức
        this.style.display = 'none';
        
        if (stopTimeDisplay) {
          stopTimeDisplay.textContent = formatDisplayTime(now);
        }
        
        // Tính thời gian dừng máy
        if (stopTimeInput && resumeTimeInput && stopDuration) {
          if (resumeTimeInput.value) {
            calculateDurationForReason(stopTimeInput, resumeTimeInput, stopDuration);
          }
        }
        
        // Cập nhật tiến độ
        if (typeof updateProgress === 'function') {
          updateProgress();
        }
        
        return false;
      };
    }
  
    // SỬA NÚT CHẠY LẠI - Sử dụng onclick thay vì addEventListener
    if (resumeTimeButton) {
      resumeTimeButton.onclick = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        const now = new Date();
        const formattedDateTime = formatDateTimeForInput(now);
        if (resumeTimeInput) {
          resumeTimeInput.value = formattedDateTime;
        }
        
        // Ẩn nút ngay lập tức
        this.style.display = 'none';
        
        if (resumeTimeDisplay) {
          resumeTimeDisplay.textContent = formatDisplayTime(now);
        }
        
        // Tính thời gian dừng máy
        if (stopTimeInput && resumeTimeInput && stopDuration) {
          if (stopTimeInput.value) {
            calculateDurationForReason(stopTimeInput, resumeTimeInput, stopDuration);
          }
        }
        
        // Cập nhật tiến độ
        if (typeof updateProgress === 'function') {
          updateProgress();
        }
        
        return false;
      };
    }
  
    // Sự kiện nút xóa
    if (deleteButton) {
      deleteButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const reasonId = this.getAttribute('data-reason-id');
        const reasonEl = document.getElementById(reasonId);
        if (reasonEl) {
          reasonEl.remove();
          
          // Cập nhật tiến độ nếu cần
          if (typeof updateProgress === 'function') {
            updateProgress();
          }
        }
        
        return false;
      });
    }
  }

// Sự kiện nút xóa cho lý do đầu tiên
if (deleteReasonBtn) {
    deleteReasonBtn.addEventListener('click', function () {
        // Xóa nội dung các trường nhập liệu
        if (stopReason) stopReason.value = '';
        if (stopTimeInput) stopTimeInput.value = '';
        if (resumeTimeInput) resumeTimeInput.value = '';

        const otherReason = document.getElementById('otherReason');
        if (otherReason) otherReason.value = '';

        if (stopDuration) stopDuration.value = '';

        // Ẩn các trường
        timeInputs.forEach(input => {
            input.style.display = 'none';
        });
        if (additionalFields) additionalFields.style.display = 'none';

        // Hiển thị lại các nút
        if (stopTimeButton) stopTimeButton.style.display = 'block';
        if (resumeTimeButton) resumeTimeButton.style.display = 'block';

        // Xóa thông tin hiển thị
        if (stopTimeDisplay) stopTimeDisplay.textContent = '';
        if (resumeTimeDisplay) resumeTimeDisplay.textContent = '';

        // Ẩn nút thêm lý do
        if (addReasonSection) addReasonSection.style.display = 'none';

        updateProgress();
    });
}

// Hàm tính thời gian dừng máy
function calculateDuration() {
    if (stopTimeInput && resumeTimeInput && stopDuration &&
        stopTimeInput.value && resumeTimeInput.value) {
        const stopTime = new Date(stopTimeInput.value);
        const resumeTime = new Date(resumeTimeInput.value);

        // Kiểm tra nếu thời gian chạy lại lớn hơn thời gian dừng
        if (resumeTime > stopTime) {
            const diff = resumeTime - stopTime;

            // Tính giờ, phút, giây
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            stopDuration.value = `${hours} giờ ${minutes} phút ${seconds} giây`;
        } else {
            stopDuration.value = '0 giờ 0 phút 0 giây';
        }
        
        // Khi đã có đủ thời gian dừng và thời gian chạy lại, tự động thêm lý do mới
        setTimeout(function() {
            // Tăng biến đếm lý do
            reasonCount = reasonCount + 1;
            const newReasonId = `reason-${reasonCount}`;
            
            // Kiểm tra xem đã có phần tử này chưa
            if (document.getElementById(newReasonId)) return;
            
            // Tạo HTML cho lý do mới
            const newReasonHtml = `
              <div class="stop-reason-container" id="${newReasonId}">
                <hr>
                <div class="row mb-3">
                  <div class="col-4">
                    <label class="fw-bold mb-1">Lý do dừng máy</label>
              <select class="form-select" id="stopReason">
                <option value>-- Lý do --</option>
                <option value="Máy hư">F1 : Máy hư</option>
                <option value="Chờ giấy">F2 : Chờ giấy</option>
                <option value="Chờ tiếp thị">F3 : Bảo trì định kỳ</option>
                <option value="Chờ kế hoạch">F4 : Chờ kế hoạch</option>
                <option value="Vệ sinh">F5 : Vệ sinh</option>
                <option value="Khác">F6 : Khác</option>
                <option value="Bảo dưỡng">F7 : Bảo dưỡng</option>
                <option value="Sửa kẽm">F8 : Sửa kẽm</option>
                <option value="Thay su">F9 : Thay su</option>
                <option value="CHỜ KHÁCH TỚI KÝ BÀI">F10 : CHỜ KHÁCH TỚI KÝ BÀI</option>
                <option value="Cắt bảng DB">F11 : Cắt bảng DB</option>
                <option value="Giải lao">F12 : Giải lao</option>
                <option value="Cúp điện">F13 : Cúp điện</option>
              </select>
                  </div>
                  
                  <div class="col-4 time-inputs-${reasonCount}" style="display: none;">
                    <label class="fw-bold mb-1">Thời gian dừng máy</label>
                    <div class="position-relative">
                      <input type="datetime-local" class="form-control stop-time-input">
                      <button class="btn btn-primary position-absolute top-0 end-0 h-100 stop-time-button" style="z-index: 10;">
                        Dừng máy
                      </button>
                    </div>
                    <div class="form-text stop-time-display"></div>
                  </div>
                  
                  <div class="col-4 time-inputs-${reasonCount}" style="display: none;">
                    <label class="fw-bold mb-1">Thời gian chạy lại</label>
                    <div class="position-relative">
                      <input type="datetime-local" class="form-control resume-time-input">
                      <button class="btn btn-success position-absolute top-0 end-0 h-100 resume-time-button" style="z-index: 10;">
                        Chạy lại
                      </button>
                    </div>
                    <div class="form-text resume-time-display"></div>
                  </div>
                </div>
                
                <div class="row mb-3 additional-fields-${reasonCount}" style="display: none;">
                  <div class="col-8">
                    <label class="fw-bold mb-1">Lý do khác</label>
                    <input type="text" class="form-control" placeholder="Nhập lý do...">
                  </div>
                  <div class="col-4">
                    <label class="fw-bold mb-1 text-primary">Thời gian dừng máy</label>
                    <input type="text" class="form-control bg-light stop-duration" readonly>
                  </div>
                </div>
                
                <div class="d-flex justify-content-end mb-3">
                  <button class="btn btn-danger delete-reason-btn" data-reason-id="${newReasonId}">
                    <i class="bi bi-trash">🗑️</i>
                  </button>
                </div>
              </div>
            `;
            
            // Tìm container để thêm vào
            const additionalReasonsContainer = document.getElementById('additionalReasonsContainer');
            if (additionalReasonsContainer) {
                additionalReasonsContainer.insertAdjacentHTML('beforeend', newReasonHtml);
                
                // Thiết lập sự kiện cho lý do mới
                setupNewReasonEvents(newReasonId);
            }
        }, 500);
    }
}

// Hàm tính thời gian dừng máy cho các lý do bổ sung
function calculateDurationForReason(stopInput, resumeInput, durationOutput) {
    if (stopInput && resumeInput && durationOutput &&
        stopInput.value && resumeInput.value) {
        const stopTime = new Date(stopInput.value);
        const resumeTime = new Date(resumeInput.value);

        if (resumeTime > stopTime) {
            const diff = resumeTime - stopTime;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            durationOutput.value = `${hours} giờ ${minutes} phút ${seconds} giây`;
        } else {
            durationOutput.value = '0 giờ 0 phút 0 giây';
        }
    }
}

// Hàm định dạng datetime cho input
function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Thêm giây vào định dạng datetime-local
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Hàm định dạng thời gian hiển thị
function formatDisplayTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}


//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG QUẢN LÝ TIẾN ĐỘ VÀ NÚT ĐIỀU KHIỂN
//  Mô tả: Quản lý tiến độ, hiển thị các nút bắt đầu và xác nhận khi đủ thông tin
//! =================================================================

//todo Cập nhật tiến độ của form========================================================
function updateProgress() {
    // Tính toán tiến độ phần bắt đầu báo cáo
    const startProgress = calculateStartProgress();

    // Tính toán tiến độ phần kết thúc báo cáo
    const endProgress = calculateEndProgress();

    // Hiển thị tiến độ và nút bắt đầu
    updateStartProgressDisplay(startProgress);

    // Hiển thị tiến độ và nút xác nhận
    updateEndProgressDisplay(endProgress);
}

// Thêm hàm đặc biệt tính tiến độ cho phiếu bổ sung sau
function updateProgressForPendingFormula() {
  // Kiểm tra xem có phải là phiếu bổ sung sau không
  const isPendingFormula = document.body.hasAttribute('data-need-formula-update');
  
  if (!isPendingFormula) return updateProgress(); // Sử dụng hàm thông thường nếu không phải
  
  // Danh sách trường cần kiểm tra cho phiếu bổ sung sau
  const requiredFields = [
      'ca', 'nguoi', 'soPhieu', 'thuTu'
  ];
  
  // Kiểm tra các trường bắt buộc
  let filledCount = 0;
  requiredFields.forEach(field => {
      const element = document.getElementById(field);
      if (element && element.value.trim() && 
          !(field === 'soPhieu' && element.value.trim() === 'PSC')) {
          filledCount++;
      }
  });
  
  // Kiểm tra vị trí đã chọn
  const hasSelectedPosition = 
      document.getElementById('viTri1Select').value ||
      document.getElementById('viTri2Select').value ||
      document.getElementById('viTri3Select').value;
  
  if (hasSelectedPosition) filledCount++;
  
  // Kiểm tra mã số cuộn
  if (getMaSoCuonValue()) filledCount++;
  
  // Tính phần trăm tiến độ
  const totalRequired = requiredFields.length + 2; // +2 cho vị trí và mã số cuộn
  const progress = Math.round((filledCount / totalRequired) * 100);
  
  // Cập nhật hiển thị tiến độ và bật nút bắt đầu
  updateStartProgressDisplay(progress);
  
  return progress;
}

//todo Tính tiến độ phần bắt đầu báo cáo========================================================
function calculateStartProgress() {
    let filledFields = 0;
    let totalFields = 0;

    // Kiểm tra nếu đang xử lý phiếu bổ sung sau
    if (document.body.hasAttribute('data-need-formula-update')) {
      return updateProgressForPendingFormula();
  }
    
    // Kiểm tra nếu đây là báo cáo dừng máy độc lập
    const isDungMayOnly = document.getElementById('btnYes')?.style.backgroundColor === 'rgb(208, 0, 0)' && 
                        (!document.getElementById('soPhieu')?.value || document.getElementById('soPhieu')?.value === 'PSC') &&
                        (!document.getElementById('ws')?.value);

    if (isDungMayOnly) {
        // Nếu là báo cáo dừng máy độc lập, chỉ kiểm tra Ca và Người thực hiện
        const requiredFields = ['ca', 'nguoi'];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                totalFields++;
                if (element.value.trim()) {
                    filledFields++;
                }
            }
        });
        
        // Báo cáo dừng máy độc lập nên cho phép trống số phiếu và ws
        return 100; // Đơn giản hóa thành 100% để có thể bắt đầu
    } else {
        // Xử lý như bình thường cho báo cáo SCL đầy đủ
        // Danh sách các trường bắt buộc ở phần bắt đầu
        const requiredFields = [
            'ca', 'nguoi', 'soPhieu', 'thuTu', 'ws',
            'maVatTu', 'khoCanSang', 'khoSanPham', 'khachHang'
        ];

        // Chỉ kiểm tra vị trí 1 - không bao gồm vị trí 2 và 3
        const viTri1 = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(1) input');

        // Trường trọng lượng
        const trongLuong = document.getElementById('trongLuong');

        // Kiểm tra trạng thái ID
        const nhapSoID = document.getElementById('nhapSoID');
        const inputSoID = document.getElementById('inputSoID');

        // Mã số cuộn
        const maSoCuon = document.getElementById('maSoCuon');

        // Kiểm tra các trường bắt buộc
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                totalFields++;
                
                // Đối với trường soPhieu, giá trị 'PSC' mặc định không được tính là đã điền
                if (field === 'soPhieu') {
                    if (element.value.trim() && element.value.trim() !== 'PSC') {
                        filledFields++;
                    }
                } else if (element.value.trim()) {
                    filledFields++;
                }
            }
        });

        // Kiểm tra vị trí 1
        if (viTri1) {
            totalFields++;
            if (viTri1.value.trim()) {
                filledFields++;
            }
        }

        // Kiểm tra trọng lượng
        if (trongLuong) {
            totalFields++;
            if (trongLuong.value.trim()) {
                filledFields++;
            }
        }

        // Kiểm tra mã số cuộn - Bắt buộc phải nhập
        if (maSoCuon) {
            totalFields++;
            if (getMaSoCuonValue()) {
                filledFields++;
            }
        }

        // Kiểm tra trường ID
        if (nhapSoID && inputSoID) {
            totalFields++;
            if (!nhapSoID.checked || (nhapSoID.checked && inputSoID.value.trim())) {
                filledFields++;
            }
        }

        // Tính phần trăm hoàn thành
        return Math.round((filledFields / totalFields) * 100);
    }
}

//todo Tính tiến độ phần kết thúc báo cáo========================================================
function calculateEndProgress() {
    let filledFields = 0;
    let totalFields = 0;

    // Kiểm tra nếu đây là báo cáo dừng máy độc lập
    const isDungMayOnly = document.getElementById('btnYes')?.style.backgroundColor === 'rgb(208, 0, 0)' && 
                        (!document.getElementById('soPhieu')?.value || document.getElementById('soPhieu')?.value === 'PSC') &&
                        (!document.getElementById('ws')?.value);

    if (isDungMayOnly) {
        // Nếu là báo cáo dừng máy độc lập, chỉ kiểm tra thông tin dừng máy
        const stopReason = document.getElementById('stopReason');
        const stopTimeInput = document.getElementById('stopTimeInput');
        const resumeTimeInput = document.getElementById('resumeTimeInput');
        
        totalFields = 3; // Lý do dừng máy, thời gian dừng, thời gian chạy lại
        
        if (stopReason && stopReason.value) filledFields++;
        if (stopTimeInput && stopTimeInput.value) filledFields++;
        if (resumeTimeInput && resumeTimeInput.value) filledFields++;
        
        // Tính phần trăm hoàn thành - trường hợp báo cáo dừng máy
        return Math.round((filledFields / totalFields) * 100);
    } else {
        // Danh sách các trường bắt buộc ở phần kết thúc (báo cáo SCL đầy đủ)
        const requiredFields = [
            document.querySelector('.row .col-6:first-child input:nth-child(1)'), // Khổ 1
            document.querySelector('.col-6 .row.g-2 .col:first-child input'), // Số mét
            document.querySelector('.col-6 .row.g-2 .col:last-child select'), // Sử dụng
            document.querySelector('.col-6:first-child input:nth-child(1)'), // Số kg nhập tay 1
            document.querySelector('.row.g-2 .col:first-child input'), // Phế liệu đầu cuộn
            document.querySelector('.row.g-2 .col:last-child input')  // Phế liệu sản xuất
        ];

        // Kiểm tra các trường bắt buộc
        requiredFields.forEach(element => {
            if (element) {
                totalFields++;
                if (element.value && element.value.trim()) {
                    filledFields++;
                }
            }
        });

        // Kiểm tra trạng thái dừng máy
        totalFields++;
        const machineReport = document.getElementById('machineReport');
        const btnNo = document.getElementById('btnNo');
        const btnYes = document.getElementById('btnYes');

        // Nếu chọn "Không" dừng máy
        if (btnNo && btnNo.style.backgroundColor === 'rgb(74, 144, 226)') {
            filledFields++;
        }
        // Nếu chọn "Có" dừng máy và đã điền đầy đủ thông tin
        else if (btnYes && btnYes.style.backgroundColor === 'rgb(208, 0, 0)' &&
            machineReport && machineReport.style.display === 'block') {

            // Kiểm tra thông tin trong báo cáo dừng máy
            const isStopReportComplete = checkStopReportComplete();

            if (isStopReportComplete) {
                filledFields++;
            }
        }

        // Tính phần trăm hoàn thành
        return Math.round((filledFields / totalFields) * 100);
    }
}

//todo Kiểm tra tính đầy đủ của báo cáo dừng máy========================================================
function checkStopReportComplete() {
    const stopReason = document.getElementById('stopReason');
    const stopTimeInput = document.getElementById('stopTimeInput');
    const resumeTimeInput = document.getElementById('resumeTimeInput');

    // Kiểm tra nếu đã chọn lý do và điền thời gian
    if (stopReason && stopReason.value &&
        stopTimeInput && stopTimeInput.value &&
        resumeTimeInput && resumeTimeInput.value) {

        // Kiểm tra các lý do phụ (nếu có)
        const additionalReasons = document.querySelectorAll('.stop-reason-container');

        for (const reason of additionalReasons) {
            const reasonSelect = reason.querySelector('.stop-reason-select');
            const reasonStopTime = reason.querySelector('.stop-time-input');
            const reasonResumeTime = reason.querySelector('.resume-time-input');

            // Nếu có lý do nhưng không có thời gian
            if (reasonSelect && reasonSelect.value &&
                (!reasonStopTime.value || !reasonResumeTime.value)) {
                return false;
            }
        }

        return true;
    }

    return false;
}

//todo Cập nhật hiển thị tiến độ bắt đầu và nút bắt đầu========================================================
function updateStartProgressDisplay(progress) {
    const progressBar = document.querySelector('.progress-bar.bg-success');
    const progressText = document.querySelector('.progress + span');
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }

    if (progressText) {
        progressText.textContent = `${progress}%`;
    }

    // Hiển thị nút bắt đầu khi tiến độ đạt 100%
    if (startButton) {
        startButton.style.display = progress === 100 ? 'inline-block' : 'none';
    }
}

//todo Cập nhật hiển thị tiến độ kết thúc và nút xác nhận========================================================
function updateEndProgressDisplay(progress) {
    const progressBar = document.querySelector('.progress-bar.bg-danger');
    const progressText = document.querySelector('.col-12 .progress + span');
    const confirmButton = document.querySelector('.btn.btn-primary');

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        console.log(`Đã cập nhật tiến độ: ${progress}%`);
    }

    if (progressText) {
        progressText.textContent = `${progress}%`;
    }

    // Hiển thị và kích hoạt nút xác nhận khi tiến độ đạt mức cần thiết
    if (confirmButton) {
        // Mặc định cho phép nhấn nút, bỏ comment dòng dưới nếu muốn kiểm tra tiến độ
         confirmButton.disabled = progress < 100;
        //confirmButton.disabled = false; // Luôn cho phép nhấn để test

        if (confirmButton.disabled) {
            confirmButton.style.opacity = '0.6';
            confirmButton.style.cursor = 'not-allowed';
            console.log('Nút xác nhận đã bị vô hiệu hóa do tiến độ chưa đủ');
        } else {
            confirmButton.style.opacity = '1';
            confirmButton.style.cursor = 'pointer';
            console.log('Nút xác nhận đã được kích hoạt');
        }
    } else {
        console.error('Không tìm thấy nút xác nhận');
    }
}

//todo Thiết lập sự kiện cho nút bắt đầu========================================================
function setupStartButtonEvent() {
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');

    if (startButton) {
        startButton.addEventListener('click', function () {
            // Ghi lại thời gian bắt đầu
            const now = new Date();

            // Hiển thị thời gian bắt đầu
            const startTimeElement = document.getElementById('startTime');
            if (startTimeElement) {
                startTimeElement.textContent = formatTime(now);
            }

            // Hiển thị thời gian trong phần thông báo
            const startTimeText = document.querySelector('.text-success.fw-bold.mb-2');
            if (startTimeText) {
                startTimeText.textContent = `Thời gian bắt đầu: ${formatTime(now)}`;
            }

            // Lưu thời gian bắt đầu để sử dụng khi gửi dữ liệu
            document.body.setAttribute('data-start-time', now.toISOString());

            // Vô hiệu hóa nút sau khi bấm
            startButton.disabled = true;
        });
    }
}

//todo Thiết lập sự kiện cho nút xác nhận========================================================
function setupConfirmButtonEvent() {
    const confirmButton = document.querySelector('.btn.btn-primary');

    if (confirmButton) {
        console.log('Đã tìm thấy nút xác nhận:', confirmButton);

        // Đảm bảo nút không bị disabled (vô hiệu hóa)
        confirmButton.disabled = false;

        confirmButton.addEventListener('click', function (event) {
            console.log('Đã bấm nút xác nhận');
            event.preventDefault(); // Ngăn chặn hành vi mặc định nếu nút nằm trong form

            // Ghi lại thời gian kết thúc
            const now = new Date();

            // Lưu thời gian kết thúc để sử dụng khi gửi dữ liệu
            document.body.setAttribute('data-end-time', now.toISOString());

            // Gửi dữ liệu báo cáo
            submitReport();
        });

        console.log('Đã thiết lập sự kiện click cho nút xác nhận');
    } else {
        console.error('Không tìm thấy nút xác nhận trong trang');

        // Tìm kiếm với selector khác để debug
        const allButtons = document.querySelectorAll('button');
        console.log('Tất cả các nút trong trang:', allButtons.length);
        allButtons.forEach((btn, index) => {
            console.log(`Nút ${index}:`, btn.textContent, btn);
        });
    }
}

//todo Định dạng thời gian hiển thị (HH:MM:SS)========================================================
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}


//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG GỬI DỮ LIỆU VÀ KẾT NỐI API
//  Mô tả: Xử lý việc gửi dữ liệu báo cáo lên server
//! =================================================================

//todo Thiết lập sự kiện khi thay đổi dữ liệu form========================================================
function setupFormChangeEvents() {
    // Lấy tất cả các input, select trong form
    const formInputs = document.querySelectorAll('input, select, textarea');

    formInputs.forEach(input => {
        input.addEventListener('change', function () {
            // Cập nhật tiến độ khi có thay đổi
            updateProgress();
        });
    });

    // Thiết lập sự kiện khi chọn có số ID
    setupIDRadioEvents();
}

//todo Thiết lập sự kiện khi chọn có số ID========================================================
function setupIDRadioEvents() {
    document.querySelectorAll('input[name="chonSoID"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const input = document.getElementById('inputSoID');
            if (input) {
                input.disabled = this.value !== 'input';
                updateProgress(); // Cập nhật tiến độ khi thay đổi
            }
        });
    });
}

//todo Gửi dữ liệu báo cáo lên server========================================================
async function submitReport() {
    try {
        // Hiển thị trạng thái đang xử lý
        showLoadingState(true);

        // Thu thập dữ liệu từ form
        const reportData = collectReportData();

        if (!reportData) {
            showLoadingState(false);
            return;
        }

        console.log("Dữ liệu báo cáo:", reportData);

        // Xác nhận với người dùng trước khi gửi
        if (!confirm('Bạn có chắc chắn muốn xác nhận báo cáo này?')) {
            showLoadingState(false);
            return;
        }

        // Nếu là báo cáo dừng máy riêng biệt, gửi đến endpoint dừng máy riêng
        if (reportData.isOnlyStopReport) {
            const endpoint = '/api/bao-cao-scl/dung-may/submit';
            
            // Chuẩn bị dữ liệu cho API dừng máy riêng
            if (!reportData.dungMay || reportData.dungMay.length === 0) {
                showNotification('Không có dữ liệu dừng máy để gửi', 'error');
                showLoadingState(false);
                return;
            }
            
            const stopReportData = {
                ca: reportData.batDau.ca,
                nguoi_thuc_hien: reportData.batDau.nguoiThucHien,
                worksheet: reportData.batDau.ws || '',
                so_phieu: reportData.batDau.soPhieu || '',
                ly_do: reportData.dungMay[0].lyDo || '',
                ly_do_khac: reportData.dungMay[0].lyDoKhac || '',
                thoi_gian_dung: reportData.dungMay[0].thoiGianDung || '',
                thoi_gian_chay_lai: reportData.dungMay[0].thoiGianChayLai || '',
                thoi_gian_dung_may: reportData.dungMay[0].thoiGianDungMay || '',
                ghi_chu: reportData.dungMay[0].ghiChu || reportData.ketThuc.ghiChu || ''
            };
            
            console.log("Dữ liệu báo cáo dừng máy đã chuẩn bị:", stopReportData);
            
            // Gửi dữ liệu báo cáo dừng máy lên server
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stopReportData),
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Server response:', responseText);
                throw new Error('Lỗi khi gửi báo cáo dừng máy');
            }

            const result = await response.json();
            showNotification('Đã gửi báo cáo dừng máy thành công!', 'success');
            
            // Tùy chọn: Chuyển hướng hoặc làm mới trang sau khi gửi thành công
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } else {
            // Gửi dữ liệu báo cáo SCL đầy đủ
            const endpoint = '/api/bao-cao-scl/submit';
            
            // Kiểm tra xem có dữ liệu phiếu sang cuộn không
            const hasFormulaData = reportData.batDau.maVatTu && 
                                  reportData.batDau.ws && 
                                  reportData.batDau.khachHang;
            
            // Thêm flag vào dữ liệu để đánh dấu báo cáo cần kiểm tra cập nhật sau
            if (!hasFormulaData && reportData.batDau.soPhieu && reportData.batDau.thuTu) {
                reportData.needFormulaUpdate = true;
                console.log('Đánh dấu báo cáo cần cập nhật dữ liệu formula sau.');
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Server response:', responseText);
                throw new Error('Lỗi khi gửi báo cáo SCL');
            }

            const result = await response.json();
            
            // Nếu gửi thành công và cần cập nhật formula sau
            if (result.success && result.id && reportData.needFormulaUpdate) {
                // Thêm vào danh sách chờ cập nhật
                if (window.addPendingUpdate) {
                    window.addPendingUpdate(result.id, reportData.batDau.soPhieu, reportData.batDau.thuTu);
                    console.log(`Đã thêm báo cáo ID ${result.id} vào danh sách chờ cập nhật formula`);
                    
                    // Hiển thị thông báo đặc biệt
                    showNotification('Đã gửi báo cáo SCL thành công! Hệ thống sẽ tự động cập nhật thông tin phiếu khi có dữ liệu mới.', 'success');
                } else {
                    showNotification('Đã gửi báo cáo SCL thành công!', 'success');
                }
            } else {
                showNotification('Đã gửi báo cáo SCL thành công!', 'success');
            }
            
            // Tùy chọn: Chuyển hướng hoặc làm mới trang sau khi gửi thành công
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo:', error);
        showNotification('Lỗi khi gửi báo cáo: ' + error.message, 'error');
    } finally {
        showLoadingState(false);
    }
}







//todo Thu thập dữ liệu từ form========================================================
function collectReportData() {
  // Kiểm tra button dừng máy
  if (!machineStopStatusSelected) {
    showNotification('Vui lòng chọn CÓ hoặc KHÔNG dừng máy trước khi xác nhận', 'warning');
    
    // Làm nổi bật phần dừng máy cho người dùng thấy
    const dungMaySection = document.querySelector('.p-3.rounded.d-flex.align-items-center.justify-content-between');
    if (dungMaySection) {
      dungMaySection.style.boxShadow = '0 0 10px 5px red';
      dungMaySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        dungMaySection.style.boxShadow = '';
      }, 2000);
    }
    
    return null;
  }

  // Kiểm tra ca làm việc được chọn
  const caElement = document.getElementById('ca');
  if (!caElement || !caElement.value) {
    showNotification('Vui lòng chọn ca làm việc', 'error');
    caElement.focus();
    return null;
  }
  
  // Xử lý số phiếu - nếu chỉ có "PSC" mặc định thì coi như trống
  const soPhieuValue = document.getElementById('soPhieu')?.value || '';
  const finalSoPhieu = soPhieuValue === 'PSC' ? '' : soPhieuValue;
  
  // Kiểm tra xem có phải là báo cáo dừng máy độc lập không
  const isDungMayOnly = document.getElementById('btnYes')?.style.backgroundColor === 'rgb(208, 0, 0)' && 
                         (!finalSoPhieu || finalSoPhieu === '') &&
                         (!document.getElementById('ws')?.value || document.getElementById('ws')?.value === '');
  
  console.log("Phát hiện báo cáo dừng máy độc lập:", isDungMayOnly);
  
  // Kiểm tra nếu là phiếu bổ sung sau
  const isPendingFormula = document.body.hasAttribute('data-need-formula-update');
  
  // SỬA: Thu thập dữ liệu khổ chính xác
  // Lấy từ các input vị trí thực tế
  const viTri1Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(1) input');
  const viTri2Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(2) input');
  const viTri3Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(3) input');

  const viTri1Value = viTri1Input?.value || '';
  const viTri2Value = viTri2Input?.value || '';
  const viTri3Value = viTri3Input?.value || '';

  // Tạo khổ cần sang từ các vị trí có giá trị
  let khoCanSangCalculated = '';
  const khoArray = [viTri1Value, viTri2Value, viTri3Value].filter(v => v.trim());
  if (khoArray.length > 0) {
    khoCanSangCalculated = khoArray.join('+');
  }

  console.log('Thu thập dữ liệu khổ:', {
    viTri1Value,
    viTri2Value, 
    viTri3Value,
    khoCanSangCalculated,
    khoCanSangFromInput: document.getElementById('khoCanSang')?.value
  });
  
  // Thu thập dữ liệu phần bắt đầu báo cáo
  const startData = {
    ca: document.getElementById('ca')?.value || '',
    nguoiThucHien: document.getElementById('nguoi')?.value || '',
    soPhieu: finalSoPhieu,
    thuTu: document.getElementById('thuTu')?.value || '',
    sttXuat: document.getElementById('sttXuat')?.value || '',
    ws: document.getElementById('ws')?.value || '',
    khachHang: document.getElementById('khachHang')?.value || '',
    maVatTu: document.getElementById('maVatTu')?.value || '',
    khoCanSang: document.getElementById('khoCanSang')?.value || khoCanSangCalculated, // Ưu tiên input, fallback tính toán
    khoSanPham: document.getElementById('khoSanPham')?.value || '',
    // SỬA: Thu thập đúng giá trị vị trí
    viTri1: viTri1Value,
    viTri2: viTri2Value,
    viTri3: viTri3Value,
    // Thu thập giá trị select vị trí
    viTriSelect1: isPendingFormula ? (document.getElementById('viTri1Select')?.value || '') : 
        (viTri1Value ? document.getElementById('viTri1Select')?.value || '' : ''),
    viTriSelect2: isPendingFormula ? (document.getElementById('viTri2Select')?.value || '') :
        (viTri2Value ? document.getElementById('viTri2Select')?.value || '' : ''),
    viTriSelect3: isPendingFormula ? (document.getElementById('viTri3Select')?.value || '') :
        (viTri3Value ? document.getElementById('viTri3Select')?.value || '' : ''),
    maSoCuon: getMaSoCuonValue(),
    soID: document.getElementById('nhapSoID')?.checked ? document.getElementById('inputSoID')?.value : null,
    trongLuong: document.getElementById('trongLuong')?.value || '',
    thoiGianBatDau: document.body.getAttribute('data-start-time') || '',
  };

  // Thu thập dữ liệu phần kết thúc báo cáo
  const endData = {
    // SỬA: Thu thập khổ từ phần kết thúc báo cáo - ưu tiên từ startData nếu có
    khoViTri1: document.querySelector('.row .col-6:first-child input:nth-child(1)')?.value || startData.viTri1 || '',
    khoViTri2: document.querySelector('.row .col-6:first-child input:nth-child(2)')?.value || startData.viTri2 || '',
    khoViTri3: document.querySelector('.row .col-6:first-child input:nth-child(3)')?.value || startData.viTri3 || '',
    soMet: document.querySelector('.col-6 .row.g-2 .col:first-child input')?.value || '',
    suDung: document.querySelector('.col-6 .row.g-2 .col:last-child select')?.value || '',
    soKg1: document.querySelector('.col-6:first-child .d-flex.gap-2.mb-3 input:nth-child(1)')?.value || '',
    soKg2: document.querySelector('.col-6:first-child .d-flex.gap-2.mb-3 input:nth-child(2)')?.value || '',
    soKg3: document.querySelector('.col-6:first-child .d-flex.gap-2.mb-3 input:nth-child(3)')?.value || '',
    // SỬA: Sửa selector cho phế liệu - tìm đúng vị trí trong HTML
    pheLieuDauCuon: document.getElementById('pheLieuDauCuon')?.value || '',
    pheLieuSanXuat: document.getElementById('pheLieuSanXuat')?.value || '',
    ghiChu: document.querySelector('.col-6:first-child textarea')?.value || 
            document.querySelector('textarea[placeholder*="Ghi chú"]')?.value || '',
    // SỬA: Cập nhật selector cho khổ sai và số mét sai
    khoSai1: document.querySelector('.col-6 .mb-3 .d-flex.gap-2 input:nth-child(1)')?.value || 
              document.querySelector('input[placeholder*="Khổ sai 1"]')?.value || '',
    khoSai2: document.querySelector('.col-6 .mb-3 .d-flex.gap-2 input:nth-child(2)')?.value || 
              document.querySelector('input[placeholder*="Khổ sai 2"]')?.value || '',
    khoSai3: document.querySelector('.col-6 .mb-3 .d-flex.gap-2 input:nth-child(3)')?.value || 
              document.querySelector('input[placeholder*="Khổ sai 3"]')?.value || '',
              soMetSai: document.querySelector('label.fw-bold.text-danger + input.form-control.bg-white')?.value || 
              document.querySelector('input.form-control.bg-white:not([placeholder])')?.value || '',
    thoiGianKetThuc: document.body.getAttribute('data-end-time') || new Date().toISOString(),
    dungMay: document.getElementById('btnYes')?.style.backgroundColor === 'rgb(208, 0, 0)',
};
  // Thu thập dữ liệu báo cáo dừng máy (nếu có)
  const stopReports = [];

  if (endData.dungMay || isDungMayOnly) {
    // Thu thập dữ liệu lý do dừng máy chính
    const mainStopReason = document.getElementById('stopReason');
    const mainOtherReason = document.getElementById('otherReason');
    const mainStopTime = document.getElementById('stopTimeInput');
    const mainResumeTime = document.getElementById('resumeTimeInput');
    const mainDuration = document.getElementById('stopDuration');
    
    // Nếu lý do chính có đầy đủ thông tin, thêm vào danh sách
    if (mainStopReason && mainStopReason.value && 
        mainStopTime && mainStopTime.value && 
        mainResumeTime && mainResumeTime.value) {
      
      stopReports.push({
        lyDo: mainStopReason.value,
        lyDoKhac: mainOtherReason ? mainOtherReason.value : '',
        thoiGianDung: mainStopTime.value,
        thoiGianChayLai: mainResumeTime.value,
        thoiGianDungMay: mainDuration ? mainDuration.value : '',
        ghiChu: endData.ghiChu
      });
    }
    
    // Thu thập dữ liệu các lý do bổ sung
    const additionalReasons = document.querySelectorAll('.stop-reason-container');

    additionalReasons.forEach(container => {
      const select = container.querySelector('.stop-reason-select') || 
                     container.querySelector('select');
      const otherInput = container.querySelector('input[placeholder="Nhập lý do..."]');
      const stopInput = container.querySelector('.stop-time-input');
      const resumeInput = container.querySelector('.resume-time-input');
      const durationInput = container.querySelector('.stop-duration');
      
      // Chỉ thu thập nếu có đầy đủ thông tin
      if (select && select.value && stopInput && stopInput.value && resumeInput && resumeInput.value) {
        stopReports.push({
          lyDo: select.value,
          lyDoKhac: otherInput ? otherInput.value : '',
          thoiGianDung: stopInput.value,
          thoiGianChayLai: resumeInput.value,
          thoiGianDungMay: durationInput ? durationInput.value : '',
          ghiChu: endData.ghiChu
        });
      }
    });
    
    // Kiểm tra nếu không có lý do nào được thu thập
    if (stopReports.length === 0 && endData.dungMay) {
      showNotification('Vui lòng điền đầy đủ ít nhất một lý do dừng máy', 'warning');
      if (mainStopReason) mainStopReason.focus();
      return null;
    }
  }

  // Kết hợp tất cả dữ liệu
  const reportData = {
    batDau: startData,
    ketThuc: endData,
    dungMay: (endData.dungMay || isDungMayOnly) ? stopReports : null,
    nguoiDung: getCurrentUser(),
    isOnlyStopReport: isDungMayOnly
  };

  // Ghi log số lượng lý do dừng máy đã thu thập
  console.log(`Đã thu thập ${stopReports.length} lý do dừng máy`);

  // Kiểm tra nếu đây là báo cáo phiếu bổ sung sau
  if (isPendingFormula) {
      const reportSoPhieu = document.body.getAttribute('data-so-phieu');
      const reportThuTu = document.body.getAttribute('data-thu-tu');
      
      if (reportSoPhieu && reportThuTu) {
          reportData.needFormulaUpdate = true;
          reportData.updateInfo = {
              soPhieu: reportSoPhieu,
              thuTu: reportThuTu
          };
          
          // Đánh dấu để xử lý đặc biệt ở backend
          reportData.isPendingFormula = true;
          
          console.log('Đây là phiếu bổ sung sau:', {
              soPhieu: reportSoPhieu,
              thuTu: reportThuTu,
              viTri1: startData.viTri1,
              viTri2: startData.viTri2,
              viTri3: startData.viTri3,
              viTriSelect1: startData.viTriSelect1,
              viTriSelect2: startData.viTriSelect2,
              viTriSelect3: startData.viTriSelect3,
              khoCanSang: startData.khoCanSang
          });
      }
  }

  console.log('Dữ liệu báo cáo cuối cùng:', reportData);

  return reportData;
}


//todo Hàm thiết lập sự kiện trực tiếp cho nút xác nhận=================================
function setupManualConfirmButton() {
    // Tìm nút xác nhận - sử dụng nhiều selector để đảm bảo tìm thấy nút
    const confirmButton = document.querySelector('.btn.btn-primary') ||
        document.querySelector('.row .col-12 .btn-primary') ||
        document.querySelector('.row:last-child .btn-primary');

    if (confirmButton) {
        console.log('Thiết lập trực tiếp cho nút xác nhận:', confirmButton);

        // Thêm class để nhận biết
        confirmButton.classList.add('confirm-btn-setup');

        // Đảm bảo nút không bị vô hiệu hóa
        confirmButton.disabled = false;

        // Thêm style để dễ nhìn
        confirmButton.style.backgroundColor = '#28a745';
        confirmButton.style.borderColor = '#28a745';
        confirmButton.style.fontWeight = 'bold';

        // Thêm sự kiện click trực tiếp
        confirmButton.onclick = function (event) {
            event.preventDefault();
            console.log('Nút xác nhận được nhấn - trực tiếp');

            // Lưu thời gian kết thúc
            document.body.setAttribute('data-end-time', new Date().toISOString());

            // Gọi hàm gửi báo cáo
            submitReport();

            return false;
        };

        console.log('Đã thiết lập sự kiện onclick trực tiếp');
    } else {
        console.error('Không tìm thấy nút xác nhận trong trang - thiết lập thủ công');
    }
}

//todo Hàm kiểm tra trạng thái các nút trong trang=================================
function checkButtonsStatus() {
    console.log('Kiểm tra trạng thái các nút...');

    // Tìm tất cả các nút trong phần kết thúc báo cáo
    const endReportSection = document.querySelector('.border.border-danger.rounded-top');

    if (endReportSection) {
        const buttons = endReportSection.querySelectorAll('button');
        console.log(`Tìm thấy ${buttons.length} nút trong phần kết thúc báo cáo`);

        // Kiểm tra từng nút
        buttons.forEach((btn, index) => {
            console.log(`Nút ${index}:`, {
                text: btn.textContent.trim(),
                disabled: btn.disabled,
                visible: btn.offsetParent !== null,
                classes: btn.className,
                id: btn.id
            });

            // Nếu là nút Xác nhận thì bổ sung sự kiện
            if (btn.textContent.trim() === 'Xác nhận' ||
                btn.className.includes('btn-primary')) {
                console.log('Tìm thấy nút Xác nhận - đang thêm sự kiện');

                // Đảm bảo nút không bị vô hiệu hóa
                btn.disabled = false;

                // Thêm sự kiện
                if (!btn.classList.contains('confirm-btn-setup')) {
                    btn.classList.add('confirm-btn-setup');

                    btn.addEventListener('click', function (event) {
                        event.preventDefault();
                        console.log('Nút xác nhận được nhấn - từ kiểm tra');

                        // Lưu thời gian kết thúc
                        document.body.setAttribute('data-end-time', new Date().toISOString());

                        // Gọi hàm gửi báo cáo
                        submitReport();

                        return false;
                    });
                }
            }
        });
    } else {
        console.error('Không tìm thấy phần kết thúc báo cáo');
    }
}


// Hàm kiểm tra và cập nhật dữ liệu phiếu sang cuộn định kỳ
function setupAutomaticDataUpdate() {
    // Danh sách các báo cáo đang chờ cập nhật
    const pendingUpdates = [];
    
    // Thêm báo cáo vào danh sách chờ cập nhật
    window.addPendingUpdate = function(reportId, soPhieu, thuTu) {
        pendingUpdates.push({
            reportId,
            soPhieu,
            thuTu,
            lastChecked: Date.now()
        });
        
        // Lưu danh sách vào localStorage để giữ lại qua các phiên
        localStorage.setItem('pendingFormulaUpdates', JSON.stringify(pendingUpdates));
        console.log(`Đã thêm báo cáo ID ${reportId} với số phiếu ${soPhieu}, thứ tự ${thuTu} vào danh sách chờ cập nhật`);
    };
    
    // Tải danh sách chờ cập nhật từ localStorage (nếu có)
    const savedUpdates = localStorage.getItem('pendingFormulaUpdates');
    if (savedUpdates) {
        try {
            const parsed = JSON.parse(savedUpdates);
            if (Array.isArray(parsed)) {
                parsed.forEach(item => pendingUpdates.push(item));
                console.log(`Đã tải ${pendingUpdates.length} báo cáo đang chờ cập nhật từ localStorage`);
            }
        } catch (e) {
            console.error('Lỗi khi tải danh sách chờ cập nhật:', e);
        }
    }
    
    // Hàm kiểm tra và cập nhật dữ liệu
    async function checkForUpdates() {
    if (pendingUpdates.length === 0) return;
    
    console.log(`Bắt đầu kiểm tra cập nhật cho ${pendingUpdates.length} báo cáo`);
    
    try {
        // Lấy dữ liệu formula mới nhất
        const formulaList = await getFormulaData();
        if (!formulaList || formulaList.length === 0) {
            console.log('Không có dữ liệu formula để cập nhật');
            return;
        }
        
        // Duyệt qua từng báo cáo đang chờ
        const updatedReports = [];
        const remainingUpdates = [];
        
        for (const pendingReport of pendingUpdates) {
            const { reportId, soPhieu, thuTu } = pendingReport;
            
            // Lọc dữ liệu theo số phiếu
            const filteredList = formulaList.filter(item => {
                const itemSoPhieu = item.soPhieu ? item.soPhieu.trim() : '';
                return itemSoPhieu === soPhieu;
            });
            
            // Tìm phiếu có thứ tự phù hợp
            let foundData = null;
            
            if (filteredList.length > 0) {
                const thuTuNum = parseInt(thuTu);
                
                // Tìm theo sttXuat trước
                foundData = filteredList.find(item => {
                    const itemSttXuat = item.sttXuat ? parseInt(item.sttXuat) : null;
                    return itemSttXuat === thuTuNum;
                });
                
                // Nếu không tìm thấy theo sttXuat, thử dùng index
                if (!foundData && thuTuNum > 0 && thuTuNum <= filteredList.length) {
                    foundData = filteredList[thuTuNum - 1];
                }
            }
            
            if (foundData) {
                // Đã tìm thấy dữ liệu mới, cập nhật báo cáo
                try {
                    await updateReportWithNewData(reportId, foundData);
                    updatedReports.push(reportId);
                    console.log(`Đã cập nhật báo cáo ID ${reportId} với dữ liệu mới`);
                    
                    // Hiển thị thông báo cho người dùng
                    showNotification(`Báo cáo với số phiếu ${soPhieu}, thứ tự ${thuTu} đã được tự động cập nhật với dữ liệu mới`, 'success');
                } catch (error) {
                    console.error(`Lỗi khi cập nhật báo cáo ID ${reportId}:`, error);
                    // Giữ lại báo cáo này để thử cập nhật lại sau
                    remainingUpdates.push(pendingReport);
                }
            } else {
                // Chưa tìm thấy dữ liệu mới, giữ lại để kiểm tra sau
                remainingUpdates.push(pendingReport);
            }
        }
        
        // Cập nhật danh sách chờ
        pendingUpdates.length = 0;
        remainingUpdates.forEach(item => pendingUpdates.push(item));
        
        // Lưu danh sách mới vào localStorage
        localStorage.setItem('pendingFormulaUpdates', JSON.stringify(pendingUpdates));
        
        console.log(`Đã cập nhật ${updatedReports.length} báo cáo, còn ${pendingUpdates.length} báo cáo đang chờ`);
    } catch (error) {
        console.error('Lỗi khi kiểm tra cập nhật:', error);
    }
}
    
    // Hàm cập nhật báo cáo với dữ liệu mới
    async function updateReportWithNewData(reportId, newData) {
      try {
          // Lấy thông tin báo cáo hiện tại
          const response = await fetch(`/api/bao-cao-scl/${reportId}`);
          if (!response.ok) {
              throw new Error('Không thể lấy thông tin báo cáo');
          }
          
          const currentReport = await response.json();
          
          // Xử lý mã vật tư và tách khổ
          let khoSanPham = '';
          let khoCanSang = '';
          let kho1 = '', kho2 = '', kho3 = '';
          let soSanhKho = '';
          
          // 1. Xử lý cột khổ (mm) từ mã vật tư
          if (newData.mhkx) {
              // Mẫu: AABBCD-EEEE-FFFF-GGGG, lấy FFFF
              const parts = newData.mhkx.split('-');
              if (parts.length >= 3) {
                  let khoValue = parts[2]; // FFFF
                  // Nếu là 0950 thì chuyển thành 950
                  if (khoValue.startsWith('0')) {
                      khoValue = khoValue.substring(1);
                  }
                  khoSanPham = khoValue;
              }
          }
          
          // 2. Xử lý khổ cần sang và tách thành khổ 1, 2, 3
          const khoCanSangValue = newData.khoCanSang || newData.tongKhoNhap || newData.kho || '';
          if (khoCanSangValue) {
              khoCanSang = khoCanSangValue;
              
              // Tách khổ cần sang: 950+1305+950
              const khoArray = khoCanSangValue.split('+').map(k => k.trim()).filter(k => k);
              if (khoArray.length >= 1) kho1 = khoArray[0];
              if (khoArray.length >= 2) kho2 = khoArray[1];
              if (khoArray.length >= 3) kho3 = khoArray[2];
          }
          
          // 3. Tính so sánh khổ
          if (kho1 || kho2 || kho3) {
              const tongKho = (parseFloat(kho1 || 0) + parseFloat(kho2 || 0) + parseFloat(kho3 || 0));
              const khoSanPhamNum = parseFloat(khoSanPham || 0);
              
              soSanhKho = tongKho.toString();
              
              // Nếu không bằng khổ sản phẩm, thêm dấu ! để tô màu vàng
              if (khoSanPhamNum > 0 && Math.abs(tongKho - khoSanPhamNum) > 0.01) {
                  soSanhKho += '!';
              }
          }
          
          // 4. Tính số cuộn dựa trên WS
          let soCuon = 1;
          if (newData.ws || newData.WS || newData.worksheet) {
              const wsValue = newData.ws || newData.WS || newData.worksheet;
              
              try {
                  // Đếm số lượng báo cáo có cùng WS (bao gồm cả phiếu có dữ liệu và bổ sung sau)
                  const countResponse = await fetch(`/api/bao-cao-scl/list`);
                  if (countResponse.ok) {
                      const allReports = await countResponse.json();
                      
                      // Lọc các báo cáo có cùng WS và đã được tạo trước báo cáo hiện tại
                      const sameWSReports = allReports.filter(report => 
                          report.worksheet === wsValue && 
                          report.id !== reportId &&
                          new Date(report.created_at || report.ngay) <= new Date(currentReport.created_at || currentReport.ngay)
                      );
                      
                      soCuon = sameWSReports.length + 1;
                      console.log(`WS ${wsValue}: Tìm thấy ${sameWSReports.length} báo cáo trước đó, số cuộn = ${soCuon}`);
                  }
              } catch (error) {
                  console.error('Lỗi khi tính số cuộn:', error);
              }
          }
          
          // Chuẩn bị dữ liệu cập nhật
          const updateData = {
              ma_vat_tu: newData.mhkx || currentReport.ma_vat_tu,
              worksheet: newData.ws || newData.WS || newData.worksheet || currentReport.worksheet,
              khach_hang: newData.maKH || newData.khachHang || currentReport.khach_hang,
              dinh_luong: newData.dinhLuong || newData.dlXuat || currentReport.dinh_luong,
              kho_san_pham: khoSanPham || currentReport.kho_san_pham,
              kho_can_sang: khoCanSang || currentReport.kho_can_sang,
              kho: khoSanPham || currentReport.kho, // Cột khổ (mm)
              so_sanh_kho: soSanhKho || currentReport.so_sanh_kho,
              kho_1: kho1 || currentReport.kho_1,
              kho_2: kho2 || currentReport.kho_2,
              kho_3: kho3 || currentReport.kho_3,
              so_cuon: soCuon
          };
          
          console.log('Dữ liệu cập nhật:', updateData);
          
          // Gửi yêu cầu cập nhật báo cáo
          const updateResponse = await fetch(`/api/bao-cao-scl/update-formula/${reportId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateData),
          });
          
          if (!updateResponse.ok) {
              throw new Error('Không thể cập nhật báo cáo');
          }
          
          const result = await updateResponse.json();
    
          // Sau khi cập nhật thành công, gọi API tính lại nhập kho
          try {
            console.log('🔍 Bắt đầu tính lại nhập kho cho báo cáo ID:', reportId);
            
            const recalcResponse = await fetch(`/api/bao-cao-scl/recalculate-nhap-kho/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        
            console.log('📡 Response status:', recalcResponse.status);
            console.log('📡 Response ok:', recalcResponse.ok);
        
            if (recalcResponse.ok) {
                const recalcResult = await recalcResponse.json();
                console.log('📊 Kết quả từ API tính nhập kho:', recalcResult);
                
                if (recalcResult.success) {
                    console.log('✅ Đã tính lại nhập kho thành công:', recalcResult.calculated_values);
                } else {
                    console.log('ℹ️ Chưa đủ dữ liệu để tính nhập kho:', recalcResult.message);
                    if (recalcResult.missing_fields) {
                        console.log('🔍 Các trường còn thiếu:', recalcResult.missing_fields);
                    }
                }
            } else {
                const errorText = await recalcResponse.text();
                console.error('❌ Lỗi khi gọi API tính lại nhập kho:', errorText);
            }
        } catch (recalcError) {
            console.error('💥 Exception khi tính lại nhập kho:', recalcError);
        }
          
          // Sau khi cập nhật thành công, cập nhật số cuộn cho các báo cáo khác có cùng WS
          if (updateData.worksheet) {
              await updateSoCuonForSameWS(updateData.worksheet);
          }
          
          return result;
          
      } catch (error) {
          console.error(`Lỗi khi cập nhật báo cáo ID ${reportId}:`, error);
          throw error;
      }
    }
    
    // Thiết lập kiểm tra định kỳ (10 phút/lần)
    const checkInterval = 10 * 60 * 1000;
    setInterval(checkForUpdates, checkInterval);
    
    // Kiểm tra ngay khi trang tải xong
    setTimeout(checkForUpdates, 5000);
    
    console.log('Đã thiết lập cơ chế tự động cập nhật dữ liệu');
}


// Hàm cập nhật số cuộn cho tất cả báo cáo có cùng WS
async function updateSoCuonForSameWS(wsValue) {
  try {
      const response = await fetch(`/api/bao-cao-scl/list`);
      if (!response.ok) return;
      
      const allReports = await response.json();
      
      // Lọc và sắp xếp các báo cáo có cùng WS theo thời gian tạo
      const sameWSReports = allReports
          .filter(report => report.worksheet === wsValue)
          .sort((a, b) => new Date(a.created_at || a.ngay) - new Date(b.created_at || b.ngay));
      
      // Cập nhật số cuộn cho từng báo cáo
      for (let i = 0; i < sameWSReports.length; i++) {
          const newSoCuon = i + 1;
          if (sameWSReports[i].so_cuon !== newSoCuon) {
              try {
                  await fetch(`/api/bao-cao-scl/update-formula/${sameWSReports[i].id}`, {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ so_cuon: newSoCuon }),
                  });
                  console.log(`Đã cập nhật số cuộn ${newSoCuon} cho báo cáo ID ${sameWSReports[i].id}`);
              } catch (error) {
                  console.error(`Lỗi cập nhật số cuộn cho báo cáo ${sameWSReports[i].id}:`, error);
              }
          }
      }
  } catch (error) {
      console.error('Lỗi khi cập nhật số cuộn cho các báo cáo cùng WS:', error);
  }
}




//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG QUẢN LÝ DANH SÁCH BÁO CÁO
//  Mô tả: Hiển thị, phân trang, lọc danh sách báo cáo SCL
//! =================================================================


// Biến toàn cục để quản lý trạng thái của danh sách
let reportList = {
    data: [], // Dữ liệu gốc của toàn bộ danh sách
    filteredData: [], // Dữ liệu sau khi lọc
    currentPage: 1, // Trang hiện tại
    itemsPerPage: 10, // Số mục trên mỗi trang
    totalPages: 1 // Tổng số trang
};

//todo Thiết lập sự kiện cho tab danh sách báo cáo==================================================
function setupReportListTab() {
  // Thêm event listener cho tab danh sách báo cáo
  document.getElementById('nav-danhsachscl-tab').addEventListener('click', function () {
      // Tải danh sách báo cáo khi chuyển tab
      loadReportList();
  });

  // Thiết lập sự kiện cho tab dừng máy
  document.getElementById('nav-dungmayscl-tab').addEventListener('click', function () {
      // Tải danh sách báo cáo dừng máy khi chuyển tab
      loadMachineStopReportList();
  });

  // Thiết lập bộ lọc ngày
  setupDateFilter();

  // Thêm event listener cho nút tìm kiếm
  const searchButton = document.getElementById('btnSearch');
  if (searchButton) {
      searchButton.addEventListener('click', function () {
          filterReportList();
      });
  }

  // Thêm event listener cho input tìm kiếm (tìm kiếm realtime)
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
      searchInput.addEventListener('input', debounce(function() {
          filterReportList();
      }, 500)); // Debounce 500ms để tránh tìm kiếm quá nhiều lần
  }

  // Thêm event listener cho dropdown số mục trên trang
  const itemsPerPageSelect = document.getElementById('itemsPerPage');
  if (itemsPerPageSelect) {
      itemsPerPageSelect.addEventListener('change', function () {
          reportList.itemsPerPage = parseInt(this.value);
          reportList.currentPage = 1; // Reset về trang đầu tiên
          renderReportList();
      });
  }

  // Thêm event listener cho bộ lọc ca
  const caFilter = document.getElementById('caFilter');
  if (caFilter) {
      caFilter.addEventListener('change', function () {
          filterReportList();
      });
  }

  // Thêm event listener cho các nút phân trang
  setupPagination();

  // Thêm event listener cho nút xuất Excel - SỬA: Thêm phần này
  const exportButton = document.getElementById('btnExportExcel');
  if (exportButton) {
      exportButton.addEventListener('click', function () {
          exportToExcel();
      });
  }
}

//todo Tải danh sách báo cáo SCL từ server=============================================================
async function loadReportList() {
    try {
        // Hiển thị trạng thái đang tải
        showLoadingInTable(true);
        
        // Hiển thị thông báo đang tải
        // showNotification('Đang tải dữ liệu báo cáo...', 'info');

        // Gọi API để lấy danh sách báo cáo
        const response = await fetch('/api/bao-cao-scl/list');

        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo');
        }

        const data = await response.json();
        console.log('Đã tải danh sách báo cáo:', data.length, 'bản ghi');
        
        // Debug một số bản ghi đầu tiên
        if (data.length > 0) {
            console.log('Mẫu dữ liệu:', data.slice(0, 3));
            
            // Kiểm tra trường thời gian trong dữ liệu
            const timeFields = ['created_at', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'ngay'];
            console.log('Kiểm tra trường thời gian:');
            
            timeFields.forEach(field => {
                const hasField = data.some(item => item[field]);
                console.log(`- ${field}: ${hasField ? 'Có' : 'Không có'}`);
                if (hasField) {
                    const sample = data.find(item => item[field]);
                    console.log(`  Ví dụ: ${sample[field]}`);
                }
            });
        }

        // Lưu dữ liệu vào biến toàn cục
        reportList.data = data;
        reportList.filteredData = [...data]; // Sao chép dữ liệu để sử dụng cho lọc

        // Render danh sách báo cáo
        renderReportList();
        
        // Hiển thị thông báo thành công
        showNotification(`Đã tải ${data.length} bản ghi báo cáo`, 'success');

    } catch (error) {
        console.error('Lỗi khi tải danh sách báo cáo:', error);
        showNotification('Lỗi khi tải danh sách báo cáo: ' + error.message, 'error');
    } finally {
        // Ẩn trạng thái đang tải
        showLoadingInTable(false);
    }
}

//todo Hiển thị danh sách báo cáo với phân trang=======================================================
function renderReportList() {
  const tableBody = document.getElementById('reportTableBody');
  const pageInfo = document.getElementById('pageInfo');
  const totalItems = document.getElementById('totalItems');

  if (!tableBody || !pageInfo || !totalItems) {
      console.error('Không tìm thấy các phần tử cần thiết để hiển thị danh sách');
      return;
  }

  // Xóa nội dung bảng hiện tại
  tableBody.innerHTML = '';

  // Tính toán phân trang
  const totalRecords = reportList.filteredData.length;
  reportList.totalPages = Math.ceil(totalRecords / reportList.itemsPerPage);

  // Đảm bảo trang hiện tại không vượt quá tổng số trang
  if (reportList.currentPage > reportList.totalPages) {
      reportList.currentPage = Math.max(1, reportList.totalPages);
  }

  // Tính toán vị trí bắt đầu và kết thúc
  const startIndex = (reportList.currentPage - 1) * reportList.itemsPerPage;
  const endIndex = Math.min(startIndex + reportList.itemsPerPage, totalRecords);

  // Lấy dữ liệu cho trang hiện tại
  const currentPageData = reportList.filteredData.slice(startIndex, endIndex);

  // Hiển thị thông tin phân trang
  pageInfo.textContent = `Hiển thị ${startIndex + 1}-${endIndex} của ${totalRecords}`;
  totalItems.textContent = `Tổng số: ${totalRecords} bản ghi`;

  // Kiểm tra nếu không có dữ liệu
  if (currentPageData.length === 0) {
      tableBody.innerHTML = `
          <tr>
              <td colspan="46" class="text-center">Không có dữ liệu báo cáo</td>
          </tr>
      `;
      updatePaginationUI();
      return;
  }

  // Tạo các hàng dữ liệu
  currentPageData.forEach((report, index) => {
      const row = document.createElement('tr');
      row.classList.add('table-row');
      row.setAttribute('data-id', report.id);

      // Hàm để hiển thị giá trị an toàn (tránh undefined/null)
      const safeValue = (value) => {
          return value !== undefined && value !== null ? value : '';
      };

      // Hàm định dạng thời gian từ ISO string sang format HH:MM:SS DD/MM/YYYY
      const formatDateTime = (isoString) => {
          if (!isoString) return '';

          try {
              const date = new Date(isoString);
              if (isNaN(date.getTime())) return isoString;

              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              const seconds = String(date.getSeconds()).padStart(2, '0');

              return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
          } catch (e) {
              return isoString;
          }
      };

      // Định dạng giá trị ca
      const formatCa = (caValue) => {
          if (caValue === '0') return 'Ca A';
          if (caValue === '1') return 'Ca B';
          if (caValue === '2') return 'Ca HC';
          return caValue;
      };

      // Xử lý so sánh khổ với màu vàng
      let soSanhKhoClass = '';
      let soSanhKhoValue = safeValue(report.so_sanh_kho);
      if (soSanhKhoValue && soSanhKhoValue.includes('!')) {
          soSanhKhoClass = 'bg-warning';
          soSanhKhoValue = soSanhKhoValue.replace('!', '');
      }

      // Hàm customRound cho frontend
      function customRound(num, digits = 0) { // SỬA: digits = 0 thay vì 2
        if (isNaN(num)) return 0;
        
        num = parseFloat(num);
        if (isNaN(num)) return 0;
        
        const multiplier = Math.pow(10, digits);
        const shifted = num * multiplier;
        
        // SỬA: Luôn làm tròn lên khi .5 (giống Excel)
        let result;
        if (shifted >= 0) {
            result = Math.floor(shifted + 0.5) / multiplier;
        } else {
            result = Math.ceil(shifted - 0.5) / multiplier;
        }
        
        return result;
    }

      // Nội dung HTML cho hàng - SỬA TẤT CẢ CÁC LỖI
      row.innerHTML = `
          <td>
              <button class="btn btn-sm btn-primary view-report" data-id="${report.id}" title="Xem chi tiết">
                  <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-report" data-id="${report.id}" title="Xóa báo cáo">
                  <i class="fas fa-trash"></i>
              </button>
          </td>
          <td>${safeValue(report.stt)}</td>
          <td class="text-nowrap">${formatCa(safeValue(report.ca))} + ${safeValue(report.nguoi_thuc_hien)}</td>
          <td>${safeValue(report.ngay)}</td>
          <td>${safeValue(report.so_phieu)}</td>
          <td>${safeValue(report.so_lan)}</td>
          <td>${safeValue(report.worksheet)}</td>
          <td>${safeValue(report.khach_hang)}</td>
          <td>${safeValue(report.ma_vat_tu)}</td>
          <td>${safeValue(report.dinh_luong)}</td>
          <td>${safeValue(report.kho)}</td>
          <td class="${soSanhKhoClass}">${soSanhKhoValue}</td>
          <td style="font-size: 14px;">${safeValue(report.ma_so_cuon)}</td>
          <td>${safeValue(report.trong_luong_nhan)}</td>
          <td style="color: green; font-weight: bold;">${formatDateTime(safeValue(report.thoi_gian_bat_dau))}</td>
          <td style="color: red; font-weight: bold;">${formatDateTime(safeValue(report.thoi_gian_ket_thuc))}</td>
          <td>${safeValue(report.kho_1) || safeValue(report.kho_san_pham)}</td>
          <td>${safeValue(report.kho_can_sang)}</td>
          <td>${safeValue(report.kho_1)}</td>
          <td>${safeValue(report.kho_2)}</td>
          <td>${safeValue(report.kho_3)}</td>
          <td>${safeValue(report.so_met)}</td>
          <td>${safeValue(report.hoan_thanh_cuon)}</td>
          <td>${customRound(parseFloat(safeValue(report.nhap_kho_1)) || 0)}</td>
          <td>${customRound(parseFloat(safeValue(report.nhap_kho_2)) || 0)}</td>
          <td>${customRound(parseFloat(safeValue(report.nhap_kho_3)) || 0)}</td>
          <td>${safeValue(report.tra_kho)}</td>
          <td>${safeValue(report.phe_lieu_dau_cuon)}</td>
          <td>${safeValue(report.phe_lieu_san_xuat)}</td>
          <td>${safeValue(report.so_cuon)}</td>
          <td>${safeValue(report.ghi_chu)}</td>
          <td>${safeValue(report.thu_tu_cuon)}</td>
          <td>${safeValue(report.so_id)}</td>
          <td>${safeValue(report.vi_tri_1)}</td>
          <td>${safeValue(report.vi_tri_2)}</td>
          <td>${safeValue(report.vi_tri_3)}</td>
          <td>${safeValue(report.trong_luong_can_lai_1)}</td>
          <td>${safeValue(report.trong_luong_can_lai_2)}</td>
          <td>${safeValue(report.trong_luong_can_lai_3)}</td>
          <td>${safeValue(report.so_met_chay_sai)}</td>
          <td>${safeValue(report.kho_sai_1)}</td>
          <td>${safeValue(report.kho_sai_2)}</td>
          <td>${safeValue(report.kho_sai_3)}</td>
          <td>${customRound(parseFloat(safeValue(report.tl_chay_sai_1)) || 0)}</td>
          <td>${customRound(parseFloat(safeValue(report.tl_chay_sai_2)) || 0)}</td>
          <td>${customRound(parseFloat(safeValue(report.tl_chay_sai_3)) || 0)}</td>
      `;

      tableBody.appendChild(row);
  });

  // Thêm sự kiện cho các nút thao tác
  addActionButtonsEvents();

  // Cập nhật UI phân trang
  updatePaginationUI();
}

//todo Thiết lập sự kiện cho các nút phân trang=========================================================
function setupPagination() {
    // Nút trang đầu
    const firstPageBtn = document.getElementById('firstPage');
    if (firstPageBtn) {
        firstPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (reportList.currentPage > 1) {
                reportList.currentPage = 1;
                renderReportList();
            }
        });
    }

    // Nút trang trước
    const prevPageBtn = document.getElementById('prevPage');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (reportList.currentPage > 1) {
                reportList.currentPage--;
                renderReportList();
            }
        });
    }

    // Nút trang sau
    const nextPageBtn = document.getElementById('nextPage');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (reportList.currentPage < reportList.totalPages) {
                reportList.currentPage++;
                renderReportList();
            }
        });
    }

    // Nút trang cuối
    const lastPageBtn = document.getElementById('lastPage');
    if (lastPageBtn) {
        lastPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (reportList.currentPage < reportList.totalPages) {
                reportList.currentPage = reportList.totalPages;
                renderReportList();
            }
        });
    }
}

//todo Cập nhật giao diện phân trang===================================================================
function updatePaginationUI() {
    // Cập nhật trạng thái các nút trang đầu/trước
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    if (firstPageBtn && prevPageBtn) {
        if (reportList.currentPage <= 1) {
            firstPageBtn.classList.add('disabled');
            prevPageBtn.classList.add('disabled');
        } else {
            firstPageBtn.classList.remove('disabled');
            prevPageBtn.classList.remove('disabled');
        }
    }

    // Cập nhật trạng thái các nút trang sau/cuối
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');
    if (nextPageBtn && lastPageBtn) {
        if (reportList.currentPage >= reportList.totalPages) {
            nextPageBtn.classList.add('disabled');
            lastPageBtn.classList.add('disabled');
        } else {
            nextPageBtn.classList.remove('disabled');
            lastPageBtn.classList.remove('disabled');
        }
    }

    // Cập nhật các nút số trang
    updatePageNumbers();
}

//todo Cập nhật các nút số trang=======================================================================
function updatePageNumbers() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    // Xóa các nút số trang hiện tại
    const pageButtons = pagination.querySelectorAll('.page-number');
    pageButtons.forEach(btn => btn.remove());

    // Tính số trang cần hiển thị (tối đa 5 trang)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, reportList.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(reportList.totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh lại startPage nếu cần
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Tìm vị trí để chèn các nút số trang (trước nút "Trang sau")
    const nextPageBtn = document.getElementById('nextPage');
    if (!nextPageBtn) return;

    const nextPageItem = nextPageBtn.parentNode;

    // Tạo và chèn các nút số trang
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item', 'page-number');
        if (i === reportList.currentPage) {
            pageItem.classList.add('active');
        }

        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', function (e) {
            e.preventDefault();
            reportList.currentPage = i;
            renderReportList();
        });

        pageItem.appendChild(pageLink);
        pagination.insertBefore(pageItem, nextPageItem);
    }
}

//todo Hiển thị trạng thái đang tải trong bảng=========================================================
function showLoadingInTable(isLoading) {
    const tableBody = document.getElementById('reportTableBody');
    if (!tableBody) return;

    if (isLoading) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="46" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <p class="mt-2">Đang tải dữ liệu...</p>
                </td>
            </tr>
        `;
    }
}

//todo Lọc danh sách báo cáo theo các điều kiện tìm kiếm=================================================
function filterReportList() {
    const searchInput = document.getElementById('searchInput');
    const caFilter = document.getElementById('caFilter');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');

    // Lấy giá trị tìm kiếm
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const caValue = caFilter ? caFilter.value : '';
    const startDateValue = startDateFilter ? startDateFilter.value : '';
    const endDateValue = endDateFilter ? endDateFilter.value : '';

    console.log('Bắt đầu lọc với:', {
        searchText,
        ca: caValue,
        từNgày: startDateValue,
        đếnNgày: endDateValue
    });

    // Chuyển đổi ngày lọc
    const startDate = startDateValue ? new Date(startDateValue) : null;
    const endDate = endDateValue ? new Date(endDateValue) : null;
    
    // Hiển thị thông tin ngày lọc
    if (startDate) console.log('Từ ngày:', startDate.toLocaleString());
    if (endDate) console.log('Đến ngày:', endDate.toLocaleString());
    
    // Nếu endDate không có giờ được chỉ định, thiết lập thành cuối ngày
    if (endDate && endDate.getHours() === 0 && endDate.getMinutes() === 0) {
        endDate.setHours(23, 59, 59, 999);
        console.log('Đã điều chỉnh đến ngày:', endDate.toLocaleString());
    }

    // Lọc dữ liệu
    reportList.filteredData = reportList.data.filter(report => {
        // Lọc theo ca
        if (caValue && report.ca !== caValue) {
            return false;
        }

        // Lọc theo khoảng thời gian
        if (startDate || endDate) {
            // Thử lấy ngày từ các trường thời gian
            let reportDate = null;
            
            // Thứ tự ưu tiên: created_at > thoi_gian_bat_dau > thoi_gian_ket_thuc > ngay
            const dateFields = ['created_at', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'ngay'];
            
            for (const field of dateFields) {
                if (report[field]) {
                    reportDate = convertDateFormat(report[field]);
                    if (reportDate) break;
                }
            }
            
            // Nếu không có ngày hợp lệ và đang có điều kiện lọc ngày
            if (!reportDate) {
                if (startDate || endDate) {
                    console.log(`Bỏ qua báo cáo ${report.id || report.stt || 'unknown'} do không có ngày hợp lệ`);
                    return false;
                }
            } else {
                // Kiểm tra từ ngày
                if (startDate && reportDate < startDate) {
                    return false;
                }
                
                // Kiểm tra đến ngày
                if (endDate && reportDate > endDate) {
                    return false;
                }
            }
        }

        // Lọc theo từ khóa tìm kiếm (tìm trong nhiều trường)
        if (searchText) {
            // Tạo một chuỗi kết hợp từ nhiều trường để tìm kiếm
            const searchableText = [
                report.so_phieu || '',
                report.worksheet || '',
                report.khach_hang || '',
                report.ma_vat_tu || '',
                report.ma_so_cuon || '',
                report.nguoi_thuc_hien || '',
                report.ghi_chu || ''
            ].join(' ').toLowerCase();

            return searchableText.includes(searchText);
        }

        return true;
    });

    // Reset về trang đầu tiên sau khi lọc
    reportList.currentPage = 1;
    
    // In số lượng kết quả lọc
    console.log(`Kết quả lọc: ${reportList.filteredData.length}/${reportList.data.length} bản ghi`);
    
    // Hiển thị kết quả lọc
    renderReportList();
    
    // Nếu không có kết quả, hiển thị thông báo
    if (reportList.filteredData.length === 0) {
        showNotification('Không tìm thấy báo cáo nào phù hợp với điều kiện lọc', 'warning');
    }
}

//todo Thêm hàm xử lý hiển thị dữ liệu thời gian điều kiện lọc============================================================
function setupDateFilter() {
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    const dateFilterButton = document.getElementById('btnDateFilter');
    const clearFilterButton = document.getElementById('btnClearDateFilter');

    // Thiết lập giá trị mặc định nếu chưa có (ngày hiện tại)
    // if (startDateFilter && !startDateFilter.value) {
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
    //     startDateFilter.value = formatDateTimeForInput(today);
    // }

    // if (endDateFilter && !endDateFilter.value) {
    //     const today = new Date();
    //     today.setHours(23, 59, 59, 999); // Đặt thời gian về 23:59:59
    //     endDateFilter.value = formatDateTimeForInput(today);
    // }

    // Không đặt giá trị mặc định, để trống
    if (startDateFilter) {
        startDateFilter.value = ''; // Để trống - không hiển thị ngày mặc định
    }

    if (endDateFilter) {
        endDateFilter.value = ''; // Để trống - không hiển thị ngày mặc định
    }

    // Thêm sự kiện khi nhấn nút lọc
    if (dateFilterButton) {
        dateFilterButton.addEventListener('click', function() {
            if (startDateFilter && endDateFilter) {
                const startDate = new Date(startDateFilter.value);
                const endDate = new Date(endDateFilter.value);
                
                if (startDate > endDate) {
                    showNotification('Thời gian bắt đầu không được lớn hơn thời gian kết thúc', 'error');
                    return;
                }
            }
            filterReportList();
        });
    }
    
    // Thêm sự kiện cho nút xóa lọc
    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', function() {
            // // Đặt lại các giá trị lọc
            // if (startDateFilter) {
            //     const today = new Date();
            //     today.setHours(0, 0, 0, 0);
            //     startDateFilter.value = formatDateTimeForInput(today);
            // }
            
            // if (endDateFilter) {
            //     const today = new Date();
            //     today.setHours(23, 59, 59, 999);
            //     endDateFilter.value = formatDateTimeForInput(today);
            // }

            // Không đặt giá trị mặc định, để trống
    if (startDateFilter) {
        startDateFilter.value = ''; // Để trống - không hiển thị ngày mặc định
    }

    if (endDateFilter) {
        endDateFilter.value = ''; // Để trống - không hiển thị ngày mặc định
    }
            
            // Nếu đang có lọc theo ca, đặt lại thành tất cả
            const caFilter = document.getElementById('caFilter');
            if (caFilter) {
                caFilter.value = '';
            }
            
            // Nếu đang có tìm kiếm, xóa nội dung
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Lọc lại danh sách với điều kiện mặc định
            reportList.filteredData = [...reportList.data];
            reportList.currentPage = 1;
            renderReportList();
            
            showNotification('Đã xóa tất cả điều kiện lọc', 'success');
        });
    }
}


//todo Hàm chuyển đổi định dạng ngày================================================================================
function convertDateFormat(dateString) {
    if (!dateString) return null;
    
    // Xử lý trường hợp định dạng ISO
    if (dateString.includes('T') || dateString.includes('-')) {
        try {
            return new Date(dateString);
        } catch (e) {
            console.error('Lỗi chuyển đổi ngày ISO:', e);
        }
    }
    
    // Xử lý định dạng DD/MM/YYYY
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            try {
                // Chuyển đổi từ DD/MM/YYYY sang Date
                return new Date(
                    parseInt(parts[2]), // Năm
                    parseInt(parts[1]) - 1, // Tháng (0-11)
                    parseInt(parts[0]) // Ngày
                );
            } catch (e) {
                console.error('Lỗi chuyển đổi ngày DD/MM/YYYY:', e);
            }
        }
    }
    
    // Thử parse trực tiếp
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch (e) {
        console.error('Lỗi chuyển đổi ngày trực tiếp:', e);
    }
    
    return null;
}


//todo Thêm sự kiện cho các nút thao tác trong bảng=====================================================
function addActionButtonsEvents() {
    // Sự kiện cho nút xem chi tiết
    document.querySelectorAll('.view-report').forEach(button => {
        button.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            viewReportDetail(reportId);
        });
    });

    // Sự kiện cho nút xóa
    document.querySelectorAll('.delete-report').forEach(button => {
        button.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            deleteReport(reportId);
        });
    });

    // Sự kiện khi click vào hàng trong bảng
    // document.querySelectorAll('.table-row').forEach(row => {
    //     row.addEventListener('click', function (e) {
    //         // Chỉ thực hiện khi không click vào nút
    //         if (!e.target.closest('button')) {
    //             const reportId = this.getAttribute('data-id');
    //             viewReportDetail(reportId);
    //         }
    //     });
    // });
}

//todo Xem chi tiết báo cáo============================================================================
async function viewReportDetail(reportId) {
    try {
        // Gọi API để lấy chi tiết báo cáo
        const response = await fetch(`/api/bao-cao-scl/${reportId}`);

        if (!response.ok) {
            throw new Error('Không thể tải chi tiết báo cáo');
        }

        const reportDetail = await response.json();
        console.log('Chi tiết báo cáo:', reportDetail);

        // Hiển thị chi tiết báo cáo trong modal hoặc chuyển hướng đến trang chi tiết
        showReportDetailModal(reportDetail);

    } catch (error) {
        console.error('Lỗi khi tải chi tiết báo cáo:', error);
        showNotification('Lỗi khi tải chi tiết báo cáo: ' + error.message, 'error');
    }
}

//todo Hiển thị modal chi tiết báo cáo=================================================================
function showReportDetailModal(report) {
    // Kiểm tra nếu modal đã tồn tại thì xóa đi
    let existingModal = document.getElementById('reportDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Hàm để hiển thị giá trị an toàn (tránh undefined/null)
    const safeValue = (value) => {
        return value !== undefined && value !== null ? value : '';
    };

    // Tạo modal
    const modalHTML = `
    <div class="modal fade" id="reportDetailModal" tabindex="-1" aria-labelledby="reportDetailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="reportDetailModalLabel">Chi tiết báo cáo SCL - ${safeValue(report.so_phieu)}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-primary">Thông tin chung</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">STT</th>
                                    <td>${safeValue(report.stt)}</td>
                                </tr>
                                <tr>
                                    <th>Ca</th>
                                    <td>${safeValue(report.ca) === '0' ? 'Ca A' :
            safeValue(report.ca) === '1' ? 'Ca B' :
                safeValue(report.ca) === '2' ? 'Ca HC' :
                    safeValue(report.ca)}</td>
                                </tr>
                                <tr>
                                    <th>Ngày</th>
                                    <td>${safeValue(report.ngay)}</td>
                                </tr>
                                <tr>
                                    <th>Worksheet</th>
                                    <td>${safeValue(report.worksheet)}</td>
                                </tr>
                                <tr>
                                    <th>Khách hàng</th>
                                    <td>${safeValue(report.khach_hang)}</td>
                                </tr>
                                <tr>
                                    <th>Mã vật tư</th>
                                    <td>${safeValue(report.ma_vat_tu)}</td>
                                </tr>
                                <tr>
                                    <th>Định lượng</th>
                                    <td>${safeValue(report.dinh_luong)}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary">Thông tin phiếu</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Số phiếu</th>
                                    <td>${safeValue(report.so_phieu)}</td>
                                </tr>
                                <tr>
                                    <th>Số lần</th>
                                    <td>${safeValue(report.so_lan)}</td>
                                </tr>
                                <tr>
                                    <th>Thứ tự cuộn</th>
                                    <td>${safeValue(report.thu_tu_cuon)}</td>
                                </tr>
                                <tr>
                                    <th>Số cuộn</th>
                                    <td>${safeValue(report.so_cuon)}</td>
                                </tr>
                                <tr>
                                    <th>Mã số cuộn</th>
                                    <td>${safeValue(report.ma_so_cuon)}</td>
                                </tr>
                                <tr>
                                    <th>Trọng lượng nhận</th>
                                    <td>${safeValue(report.trong_luong_nhan)}</td>
                                </tr>
                                <tr>
                                    <th>Số ID</th>
                                    <td>${safeValue(report.so_id)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h6 class="text-primary">Thông tin sản xuất</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="20%">Thời gian bắt đầu</th>
                                    <td>${safeValue(report.thoi_gian_bat_dau)}</td>
                                    <th width="20%">Thời gian kết thúc</th>
                                    <td>${safeValue(report.thoi_gian_ket_thuc)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ sản phẩm</th>
                                    <td>${safeValue(report.kho_san_pham)}</td>
                                    <th>Khổ cần sang</th>
                                    <td>${safeValue(report.kho_can_sang)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ 1</th>
                                    <td>${safeValue(report.kho_1)}</td>
                                    <th>Vị trí 1</th>
                                    <td>${safeValue(report.vi_tri_1)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ 2</th>
                                    <td>${safeValue(report.kho_2)}</td>
                                    <th>Vị trí 2</th>
                                    <td>${safeValue(report.vi_tri_2)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ 3</th>
                                    <td>${safeValue(report.kho_3)}</td>
                                    <th>Vị trí 3</th>
                                    <td>${safeValue(report.vi_tri_3)}</td>
                                </tr>
                                <tr>
                                    <th>Số mét</th>
                                    <td>${safeValue(report.so_met)}</td>
                                    <th>Hoàn thành cuộn</th>
                                    <td>${safeValue(report.hoan_thanh_cuon) === '0' ? 'Chạy hết cuộn' :
            safeValue(report.hoan_thanh_cuon) === '1' ? 'Chạy lỡ' :
                safeValue(report.hoan_thanh_cuon)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-primary">Thông tin nhập xuất</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Nhập kho 1</th>
                                    <td>${safeValue(report.nhap_kho_1)}</td>
                                </tr>
                                <tr>
                                    <th>Nhập kho 2</th>
                                    <td>${safeValue(report.nhap_kho_2)}</td>
                                </tr>
                                <tr>
                                    <th>Nhập kho 3</th>
                                    <td>${safeValue(report.nhap_kho_3)}</td>
                                </tr>
                                <tr>
                                    <th>Trả kho</th>
                                    <td>${safeValue(report.tra_kho)}</td>
                                </tr>
                                <tr>
                                    <th>Phế liệu đầu cuộn</th>
                                    <td>${safeValue(report.phe_lieu_dau_cuon)}</td>
                                </tr>
                                <tr>
                                    <th>Phế liệu sản xuất</th>
                                    <td>${safeValue(report.phe_lieu_san_xuat)}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary">Thông tin cân lại</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Trọng lượng cân lại 1</th>
                                    <td>${safeValue(report.trong_luong_can_lai_1)}</td>
                                </tr>
                                <tr>
                                    <th>Trọng lượng cân lại 2</th>
                                    <td>${safeValue(report.trong_luong_can_lai_2)}</td>
                                </tr>
                                <tr>
                                    <th>Trọng lượng cân lại 3</th>
                                    <td>${safeValue(report.trong_luong_can_lai_3)}</td>
                                </tr>
                                <tr>
                                    <th>Số mét chạy sai</th>
                                    <td>${safeValue(report.so_met_chay_sai)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ sai 1</th>
                                    <td>${safeValue(report.kho_sai_1)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ sai 2</th>
                                    <td>${safeValue(report.kho_sai_2)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ sai 3</th>
                                    <td>${safeValue(report.kho_sai_3)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    ${report.dungMay && report.dungMay.length > 0 ? `
                    <div class="row">
                        <div class="col-md-12">
                            <h6 class="text-primary">Thông tin dừng máy</h6>
                            <table class="table table-bordered">
                                <thead>
                                    <tr class="table-secondary">
                                        <th>STT</th>
                                        <th>Lý do</th>
                                        <th>Lý do khác</th>
                                        <th>Thời gian dừng</th>
                                        <th>Thời gian chạy lại</th>
                                        <th>Thời gian dừng máy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${report.dungMay.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${safeValue(item.ly_do)}</td>
                                        <td>${safeValue(item.ly_do_khac)}</td>
                                        <td>${safeValue(item.thoi_gian_dung)}</td>
                                        <td>${safeValue(item.thoi_gian_chay_lai)}</td>
                                        <td>${safeValue(item.thoi_gian_dung_may)}</td>
                                    </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="row">
                        <div class="col-12">
                            <h6 class="text-primary">Ghi chú</h6>
                            <div class="p-3 border rounded">
                                ${safeValue(report.ghi_chu) || 'Không có ghi chú'}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <button type="button" class="btn btn-primary" id="printReport" data-id="${report.id}">In báo cáo</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // Thêm modal vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Hiển thị modal
    const modalElement = document.getElementById('reportDetailModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Thêm sự kiện cho nút in báo cáo
    const printButton = document.getElementById('printReport');
    if (printButton) {
        printButton.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            printReport(reportId);
        });
    }
}

//todo Xóa báo cáo================================================================================
async function deleteReport(reportId) {
    // Xác nhận trước khi xóa
    if (!confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
        return;
    }

    try {
        // Gọi API để xóa báo cáo
        const response = await fetch(`/api/bao-cao-scl/${reportId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Không thể xóa báo cáo');
        }

        showNotification('Đã xóa báo cáo thành công', 'success');

        // Tải lại danh sách báo cáo
        loadReportList();

    } catch (error) {
        console.error('Lỗi khi xóa báo cáo:', error);
        showNotification('Lỗi khi xóa báo cáo: ' + error.message, 'error');
    }
}

//todo In báo cáo==================================================================================
function printReport(reportId) {
    // Tìm modal chi tiết báo cáo
    const modalElement = document.getElementById('reportDetailModal');
    if (!modalElement) return;

    // Lấy nội dung cần in
    const printContent = modalElement.querySelector('.modal-body').cloneNode(true);

    // Tạo trang in
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>In báo cáo SCL</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { padding: 8px; border: 1px solid #ddd; }
                th { background-color: #f4f4f4; }
                h6 { margin-top: 15px; color: #0d6efd; }
                @media print {
                    .no-print { display: none; }
                    body { padding: 0; }
                }
                .header { text-align: center; margin-bottom: 20px; }
                .footer { text-align: center; margin-top: 30px; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>BÁO CÁO SCL</h2>
                <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            ${printContent.innerHTML}
            <div class="footer">
                <p>© ${new Date().getFullYear()} - Phần mềm quản lý báo cáo SCL</p>
            </div>
            <div class="no-print mt-4">
                <button class="btn btn-primary" onclick="window.print()">In báo cáo</button>
                <button class="btn btn-secondary" onclick="window.close()">Đóng</button>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
}

//todo Xuất danh sách báo cáo ra Excel==============================================================
function exportToExcel() {
  try {
      // Nếu không có dữ liệu, thông báo và thoát
      if (!reportList.filteredData || reportList.filteredData.length === 0) {
          showNotification('Không có dữ liệu để xuất', 'warning');
          return;
      }

      console.log('Bắt đầu xuất Excel, số bản ghi:', reportList.filteredData.length);
      console.log('Dữ liệu mẫu:', reportList.filteredData[0]);

      // SỬA: Hàm định dạng thời gian từ ISO string sang format HH:MM:SS DD/MM/YYYY
      const formatDateTime = (isoString) => {
          console.log('Đang format thời gian:', isoString);
          
          if (!isoString) {
              console.log('Thời gian trống, trả về chuỗi rỗng');
              return '';
          }

          try {
              const date = new Date(isoString);
              if (isNaN(date.getTime())) {
                  console.log('Thời gian không hợp lệ, trả về giá trị gốc');
                  return isoString;
              }

              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              const seconds = String(date.getSeconds()).padStart(2, '0');

              const formattedTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
              console.log('Thời gian đã format:', formattedTime);
              return formattedTime;
          } catch (e) {
              console.error('Lỗi khi format thời gian:', e);
              return isoString;
          }
      };

      // Chuẩn bị dữ liệu để xuất
      const dataToExport = reportList.filteredData.map((report, index) => {
          // Log để debug
          if (index === 0) {
              console.log('Thời gian bắt đầu gốc:', report.thoi_gian_bat_dau);
              console.log('Thời gian kết thúc gốc:', report.thoi_gian_ket_thuc);
          }

          // Hàm để hiển thị giá trị an toàn (tránh undefined/null)
          const safeValue = (value) => {
              return value !== undefined && value !== null ? value : '';
          };

          // Định dạng giá trị ca
          const formatCa = (caValue) => {
              if (caValue === '0') return 'Ca A';
              if (caValue === '1') return 'Ca B';
              if (caValue === '2') return 'Ca HC';
              return caValue;
          };

          // SỬA: Áp dụng formatDateTime cho thời gian
          const formattedBatDau = formatDateTime(report.thoi_gian_bat_dau);
          const formattedKetThuc = formatDateTime(report.thoi_gian_ket_thuc);

          // Log để debug bản ghi đầu tiên
          if (index === 0) {
              console.log('Thời gian bắt đầu đã format:', formattedBatDau);
              console.log('Thời gian kết thúc đã format:', formattedKetThuc);
          }

          // Trả về đối tượng với các trường cần xuất
          return {
              'STT': safeValue(report.stt),
              'Ca': formatCa(safeValue(report.ca)),
              'Người thực hiện': safeValue(report.nguoi_thuc_hien),
              'Ngày': safeValue(report.ngay),
              'Số Phiếu SC': safeValue(report.so_phieu),
              'Số lần': safeValue(report.so_lan),
              'Số Worksheet': safeValue(report.worksheet),
              'Khách hàng': safeValue(report.khach_hang),
              'Mã giấy': safeValue(report.ma_vat_tu),
              'Định Lượng': safeValue(report.dinh_luong),
              'Khổ (mm)': safeValue(report.kho),
              'So sánh khổ': safeValue(report.so_sanh_kho).toString().replace('!', ''),
              'Mã số cuộn': safeValue(report.ma_so_cuon),
              'TLN': safeValue(report.trong_luong_nhan),
              'TG BẮT ĐẦU': formattedBatDau, // SỬA: Sử dụng thời gian đã format
              'TG Kết Thúc': formattedKetThuc, // SỬA: Sử dụng thời gian đã format
              'Khổ sản phẩm (mm)': safeValue(report.kho_san_pham),
              'Khổ cần sang (mm)': safeValue(report.kho_can_sang),
              'Khổ 1': safeValue(report.kho_1),
              'Khổ 2': safeValue(report.kho_2),
              'Khổ 3': safeValue(report.kho_3),
              'Số mét': safeValue(report.so_met),
              'Hoàn thành cuộn': safeValue(report.hoan_thanh_cuon),
              'Nhập kho 1': safeValue(report.nhap_kho_1),
              'Nhập kho 2': safeValue(report.nhap_kho_2),
              'Nhập kho 3': safeValue(report.nhap_kho_3),
              'Trả kho': safeValue(report.tra_kho),
              'Phế liệu đầu cuộn (Kg)': safeValue(report.phe_lieu_dau_cuon),
              'Phế liệu sản xuất (Kg)': safeValue(report.phe_lieu_san_xuat),
              'Số cuộn': safeValue(report.so_cuon),
              'Ghi chú': safeValue(report.ghi_chu),
              'Thứ tự cuộn': safeValue(report.thu_tu_cuon),
              'Số ID': safeValue(report.so_id),
              'Vị trí 1': safeValue(report.vi_tri_1),
              'Vị trí 2': safeValue(report.vi_tri_2),
              'Vị trí 3': safeValue(report.vi_tri_3),
              'Trọng lượng cân lại 1': safeValue(report.trong_luong_can_lai_1),
              'Trọng lượng cân lại 2': safeValue(report.trong_luong_can_lai_2),
              'Trọng lượng cân lại 3': safeValue(report.trong_luong_can_lai_3),
              'Số mét chạy sai': safeValue(report.so_met_chay_sai),
              'Khổ sai 1 (mm)': safeValue(report.kho_sai_1),
              'Khổ sai 2 (mm)': safeValue(report.kho_sai_2),
              'Khổ sai 3 (mm)': safeValue(report.kho_sai_3),
              'Trọng lượng chạy sai 1 (kg)': safeValue(report.tl_chay_sai_1),
              'Trọng lượng chạy sai 2 (kg)': safeValue(report.tl_chay_sai_2),
              'Trọng lượng chạy sai 3 (kg)': safeValue(report.tl_chay_sai_3)
          };
      });

      console.log('Dữ liệu export mẫu:', dataToExport[0]);

      // Tạo worksheet từ dữ liệu
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Điều chỉnh độ rộng cột
      const columnWidths = [
          {wch: 5},   // STT
          {wch: 8},   // Ca
          {wch: 20},  // Người thực hiện
          {wch: 12},  // Ngày
          {wch: 15},  // Số phiếu
          {wch: 8},   // Số lần
          {wch: 15},  // Worksheet
          {wch: 20},  // Khách hàng
          {wch: 30},  // Mã giấy
          {wch: 12},  // Định lượng
          {wch: 10},  // Khổ mm
          {wch: 12},  // So sánh khổ
          {wch: 25},  // Mã số cuộn
          {wch: 8},   // TLN
          {wch: 25},  // TG BẮT ĐẦU - Tăng độ rộng
          {wch: 25},  // TG Kết thúc - Tăng độ rộng
      ];

      worksheet['!cols'] = columnWidths;

      // Tạo workbook mới
      const workbook = XLSX.utils.book_new();

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo SCL');

      // Tạo tên file với ngày hiện tại
      const now = new Date();
      const fileName = `Bao_cao_SCL_${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}.xlsx`;

      console.log('Đang xuất file:', fileName);

      // Xuất file
      XLSX.writeFile(workbook, fileName);

      showNotification('Đã xuất báo cáo thành công', 'success');
      console.log('Xuất Excel thành công');
  } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      showNotification('Lỗi khi xuất file Excel: ' + error.message, 'error');
  }
}


document.addEventListener('DOMContentLoaded', function () {
    // Kiểm tra đăng nhập
    checkAuthentication();

    // Khởi tạo form
    initializeForm();

    // Tải dữ liệu người dùng
    loadUserInfo();

    // Thiết lập các sự kiện
    setupEvents();

    // Ẩn báo cáo dừng máy ban đầu
    const machineReport = document.getElementById('machineReport');
    if (machineReport) {
        machineReport.style.display = 'none';
    }

    // Đặt tiến độ ban đầu
    updateProgress();

    // Gọi trực tiếp hàm thiết lập sự kiện cho nút xác nhận
    setupManualConfirmButton();

    // Debug - kiểm tra trạng thái các nút
    setTimeout(checkButtonsStatus, 1000);

    // Thiết lập sự kiện cho tab danh sách báo cáo
    setupReportListTab();
});









//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG QUẢN LÝ DANH SÁCH BÁO CÁO DỪNG MÁY
//  Mô tả: Hiển thị, phân trang, lọc danh sách báo cáo dừng máy SCL
//! =================================================================
// Biến toàn cục để quản lý danh sách báo cáo dừng máy
let stopReportList = {
    data: [],
    filteredData: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
};

// Hàm tải danh sách báo cáo dừng máy
async function loadMachineStopReportList() {
    try {
        // Hiển thị trạng thái đang tải
        showLoadingInTable(true, 'stopReportTableBody');
        
        // Hiển thị thông báo đang tải
        // showNotification('Đang tải dữ liệu báo cáo dừng máy...', 'info');

        // Gọi API để lấy danh sách báo cáo dừng máy
        const response = await fetch('/api/bao-cao-scl/dung-may/list');

        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo dừng máy');
        }

        const data = await response.json();
        console.log('Đã tải danh sách báo cáo dừng máy:', data.length, 'bản ghi');
        
        // Lưu dữ liệu vào biến toàn cục
        stopReportList.data = data;
        stopReportList.filteredData = [...data];

        // Render danh sách báo cáo dừng máy
        renderStopReportList();
        
        // Hiển thị thông báo thành công
        showNotification(`Đã tải ${data.length} bản ghi báo cáo dừng máy`, 'success');

    } catch (error) {
        console.error('Lỗi khi tải danh sách báo cáo dừng máy:', error);
        showNotification('Lỗi khi tải danh sách báo cáo dừng máy: ' + error.message, 'error');
    } finally {
        // Ẩn trạng thái đang tải
        showLoadingInTable(false, 'stopReportTableBody');
    }
}

// Hàm hiển thị danh sách báo cáo dừng máy
function renderStopReportList() {
    const tableBody = document.getElementById('stopReportTableBody');
    const pageInfo = document.getElementById('stopPageInfo');
    const totalItems = document.getElementById('totalStopItems');

    if (!tableBody || !pageInfo || !totalItems) {
        console.error('Không tìm thấy các phần tử cần thiết để hiển thị danh sách dừng máy');
        return;
    }

    // Xóa nội dung bảng hiện tại
    tableBody.innerHTML = '';

    // Tính toán phân trang
    const totalRecords = stopReportList.filteredData.length;
    stopReportList.totalPages = Math.ceil(totalRecords / stopReportList.itemsPerPage);

    // Đảm bảo trang hiện tại không vượt quá tổng số trang
    if (stopReportList.currentPage > stopReportList.totalPages) {
        stopReportList.currentPage = Math.max(1, stopReportList.totalPages);
    }

    // Tính toán vị trí bắt đầu và kết thúc
    const startIndex = (stopReportList.currentPage - 1) * stopReportList.itemsPerPage;
    const endIndex = Math.min(startIndex + stopReportList.itemsPerPage, totalRecords);

    // Lấy dữ liệu cho trang hiện tại
    const currentPageData = stopReportList.filteredData.slice(startIndex, endIndex);

    // Hiển thị thông tin phân trang
    pageInfo.textContent = `Hiển thị ${startIndex + 1}-${endIndex} của ${totalRecords}`;
    totalItems.textContent = `Tổng số: ${totalRecords} bản ghi`;

    // Kiểm tra nếu không có dữ liệu
    if (currentPageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">Không có dữ liệu báo cáo dừng máy</td>
            </tr>
        `;
        // Cập nhật UI phân trang
        updateStopPaginationUI();
        return;
    }

    // Tạo các hàng dữ liệu
    currentPageData.forEach((report, index) => {
        const row = document.createElement('tr');
        row.classList.add('table-row');
        row.setAttribute('data-id', report.id);

        // Hàm để hiển thị giá trị an toàn (tránh undefined/null)
        const safeValue = (value) => {
            return value !== undefined && value !== null ? value : '';
        };

        // Hàm định dạng thời gian từ ISO string
        const formatDateTime = (isoString) => {
            if (!isoString) return '';

            try {
                const date = new Date(isoString);
                if (isNaN(date.getTime())) return isoString;

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
            } catch (e) {
                return isoString;
            }
        };

        // Định dạng giá trị ca
        const formatCa = (caValue) => {
            if (caValue === '0') return 'Ca A';
            if (caValue === '1') return 'Ca B';
            if (caValue === '2') return 'Ca HC';
            return caValue;
        };

        // Nội dung HTML cho hàng
        row.innerHTML = `
            <td>${totalRecords - startIndex - index}</td>
            <td class="text-nowrap">${formatCa(safeValue(report.ca))} + ${safeValue(report.nguoi_thuc_hien)}</td>
            <td>${safeValue(report.worksheet)}</td>
            <td>${safeValue(report.so_phieu)}</td>
            <td>${formatDateTime(safeValue(report.thoi_gian_dung))}</td>
            <td>${formatDateTime(safeValue(report.thoi_gian_chay_lai))}</td>
            <td>${safeValue(report.thoi_gian_dung_may)}</td>
            <td>${safeValue(report.ly_do)}</td>
            <td>${safeValue(report.ly_do_khac || report.ghi_chu)}</td>
            <td>
                <button class="btn btn-sm btn-primary view-stop-report" data-id="${report.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-stop-report" data-id="${report.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Thêm sự kiện cho các nút thao tác
    addStopReportActionButtonsEvents();

    // Cập nhật UI phân trang
    updateStopPaginationUI();
}

// Cập nhật hiển thị phân trang cho danh sách báo cáo dừng máy
function updateStopPaginationUI() {
    // Cập nhật trạng thái các nút trang đầu/trước
    const firstPageBtn = document.getElementById('firstStopPage');
    const prevPageBtn = document.getElementById('prevStopPage');
    if (firstPageBtn && prevPageBtn) {
        if (stopReportList.currentPage <= 1) {
            firstPageBtn.classList.add('disabled');
            prevPageBtn.classList.add('disabled');
        } else {
            firstPageBtn.classList.remove('disabled');
            prevPageBtn.classList.remove('disabled');
        }
    }

    // Cập nhật trạng thái các nút trang sau/cuối
    const nextPageBtn = document.getElementById('nextStopPage');
    const lastPageBtn = document.getElementById('lastStopPage');
    if (nextPageBtn && lastPageBtn) {
        if (stopReportList.currentPage >= stopReportList.totalPages) {
            nextPageBtn.classList.add('disabled');
            lastPageBtn.classList.add('disabled');
        } else {
            nextPageBtn.classList.remove('disabled');
            lastPageBtn.classList.remove('disabled');
        }
    }

    // Cập nhật các nút số trang
    updateStopPageNumbers();
}

// Cập nhật các nút số trang cho báo cáo dừng máy
function updateStopPageNumbers() {
    const pagination = document.getElementById('stopPagination');
    if (!pagination) return;

    // Xóa các nút số trang hiện tại
    const pageButtons = pagination.querySelectorAll('.page-number');
    pageButtons.forEach(btn => btn.remove());

    // Tính số trang cần hiển thị (tối đa 5 trang)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, stopReportList.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(stopReportList.totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh lại startPage nếu cần
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Tìm vị trí để chèn các nút số trang (trước nút "Trang sau")
    const nextPageBtn = document.getElementById('nextStopPage');
    if (!nextPageBtn) return;

    const nextPageItem = nextPageBtn.parentNode;

    // Tạo và chèn các nút số trang
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item', 'page-number');
        if (i === stopReportList.currentPage) {
            pageItem.classList.add('active');
        }

        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', function (e) {
            e.preventDefault();
            stopReportList.currentPage = i;
            renderStopReportList();
        });

        pageItem.appendChild(pageLink);
        pagination.insertBefore(pageItem, nextPageItem);
    }
}

// Thêm sự kiện cho các nút trong danh sách báo cáo dừng máy
function addStopReportActionButtonsEvents() {
    // Sự kiện cho nút xem chi tiết
    document.querySelectorAll('.view-stop-report').forEach(button => {
        button.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            viewStopReportDetail(reportId);
        });
    });

    // Sự kiện cho nút xóa
    document.querySelectorAll('.delete-stop-report').forEach(button => {
        button.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            deleteStopReport(reportId);
        });
    });
}

// Hàm xem chi tiết báo cáo dừng máy
async function viewStopReportDetail(reportId) {
    try {
        // Gọi API để lấy chi tiết báo cáo
        const response = await fetch(`/api/bao-cao-scl/dung-may/${reportId}`);

        if (!response.ok) {
            throw new Error('Không thể tải chi tiết báo cáo dừng máy');
        }

        const reportDetail = await response.json();
        console.log('Chi tiết báo cáo dừng máy:', reportDetail);

        // Hiển thị chi tiết báo cáo trong modal
        showStopReportDetailModal(reportDetail);

    } catch (error) {
        console.error('Lỗi khi tải chi tiết báo cáo dừng máy:', error);
        showNotification('Lỗi khi tải chi tiết báo cáo dừng máy: ' + error.message, 'error');
    }
}

// Hiển thị modal chi tiết báo cáo dừng máy
function showStopReportDetailModal(report) {
    // Tạo modal tương tự như modal chi tiết báo cáo SCL
    let existingModal = document.getElementById('stopReportDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    const safeValue = (value) => {
        return value !== undefined && value !== null ? value : '';
    };

    // Format time function
    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
        } catch (e) {
            return isoString;
        }
    };

    // Tạo modal
    const modalHTML = `
    <div class="modal fade" id="stopReportDetailModal" tabindex="-1" aria-labelledby="stopReportDetailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="stopReportDetailModalLabel">Chi tiết báo cáo dừng máy</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-danger">Thông tin chung</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Ca</th>
                                    <td>${safeValue(report.ca) === '0' ? 'Ca A' :
                                           safeValue(report.ca) === '1' ? 'Ca B' :
                                           safeValue(report.ca) === '2' ? 'Ca HC' :
                                           safeValue(report.ca)}</td>
                                </tr>
                                <tr>
                                    <th>Người thực hiện</th>
                                    <td>${safeValue(report.nguoi_thuc_hien)}</td>
                                </tr>
                                <tr>
                                    <th>Worksheet</th>
                                    <td>${safeValue(report.worksheet)}</td>
                                </tr>
                                <tr>
                                    <th>Số phiếu</th>
                                    <td>${safeValue(report.so_phieu)}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-danger">Thông tin dừng máy</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Lý do dừng máy</th>
                                    <td>${safeValue(report.ly_do)}</td>
                                </tr>
                                <tr>
                                    <th>Lý do khác</th>
                                    <td>${safeValue(report.ly_do_khac)}</td>
                                </tr>
                                <tr>
                                    <th>Thời gian dừng</th>
                                    <td>${formatDateTime(safeValue(report.thoi_gian_dung))}</td>
                                </tr>
                                <tr>
                                    <th>Thời gian chạy lại</th>
                                    <td>${formatDateTime(safeValue(report.thoi_gian_chay_lai))}</td>
                                </tr>
                                <tr>
                                    <th>Thời gian dừng máy</th>
                                    <td>${safeValue(report.thoi_gian_dung_may)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-12">
                            <h6 class="text-danger">Ghi chú</h6>
                            <div class="p-3 border rounded">
                                ${safeValue(report.ghi_chu) || 'Không có ghi chú'}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // Thêm modal vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Hiển thị modal
    const modalElement = document.getElementById('stopReportDetailModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Hàm xóa báo cáo dừng máy
async function deleteStopReport(reportId) {
    // Xác nhận trước khi xóa
    if (!confirm('Bạn có chắc chắn muốn xóa báo cáo dừng máy này?')) {
        return;
    }

    try {
        // Gọi API để xóa báo cáo
        const response = await fetch(`/api/bao-cao-scl/dung-may/${reportId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Không thể xóa báo cáo dừng máy');
        }

        showNotification('Đã xóa báo cáo dừng máy thành công', 'success');

        // Tải lại danh sách báo cáo dừng máy
        loadMachineStopReportList();

    } catch (error) {
        console.error('Lỗi khi xóa báo cáo dừng máy:', error);
        showNotification('Lỗi khi xóa báo cáo dừng máy: ' + error.message, 'error');
    }
}

// Sửa hàm hiển thị trạng thái đang tải để hỗ trợ nhiều bảng
function showLoadingInTable(isLoading, tableBodyId = 'reportTableBody') {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;

    if (isLoading) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${tableBodyId === 'stopReportTableBody' ? 10 : 46}" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <p class="mt-2">Đang tải dữ liệu...</p>
                </td>
            </tr>
        `;
    }
}






//! ====================================================================================================================================
//! =================================================================
//! KHÁC--------------------------------------------
//! =================================================================



//! MÃ SỐ CUỘN DROPDOWN ===================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Sửa dropdown mã số cuộn - giải pháp đơn giản nhất
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const maSoCuonInput = document.getElementById('maSoCuon');
  
  if (dropdownItems && maSoCuonInput) {
    // Gắn trực tiếp sự kiện click vào từng item
    dropdownItems.forEach(item => {
      item.onclick = function(e) {
        // Ngăn chặn hành vi mặc định
        e.preventDefault();
        
        // Đơn giản lấy text và đặt vào input
        const selectedValue = this.textContent.trim();
        maSoCuonInput.value = selectedValue;
        
        // Log để kiểm tra
        console.log('Đã chọn mã số cuộn:', selectedValue);
        
        // Kích hoạt sự kiện change
        maSoCuonInput.dispatchEvent(new Event('change'));
        
        return false; // Ngăn chặn hành vi mặc định
      };
    });
  }
  });



  // Thêm hàm riêng biệt vào window để xử lý nút dừng máy
window.handleStopButtonClick = function(event) {
    // Ngăn chặn tất cả hành vi mặc định
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Thiết lập thời gian dừng máy
    const now = new Date();
    const stopTimeInput = document.getElementById('stopTimeInput');
    const stopTimeDisplay = document.getElementById('stopTimeDisplay');
    const stopTimeButton = document.getElementById('stopTimeButton');
    
    // Đặt giá trị
    if (stopTimeInput) {
      stopTimeInput.value = formatDateTimeForInput(now);
    }
    
    // Ẩn nút
    if (stopTimeButton) {
      stopTimeButton.style.display = 'none';
    }
    
    // Hiển thị thời gian
    if (stopTimeDisplay) {
      stopTimeDisplay.textContent = formatDisplayTime(now);
    }
    
    // Tính thời gian nếu cần
    if (typeof calculateDuration === 'function') {
      calculateDuration();
    }
    
    console.log("Đã xử lý dừng máy thành công");
    return false;
  };
  
  // Thêm hàm riêng biệt vào window để xử lý nút chạy lại
  window.handleResumeButtonClick = function(event) {
    // Ngăn chặn tất cả hành vi mặc định
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Thiết lập thời gian chạy lại
    const now = new Date();
    const resumeTimeInput = document.getElementById('resumeTimeInput');
    const resumeTimeDisplay = document.getElementById('resumeTimeDisplay');
    const resumeTimeButton = document.getElementById('resumeTimeButton');
    
    // Đặt giá trị
    if (resumeTimeInput) {
      resumeTimeInput.value = formatDateTimeForInput(now);
    }
    
    // Ẩn nút
    if (resumeTimeButton) {
      resumeTimeButton.style.display = 'none';
    }
    
    // Hiển thị thời gian
    if (resumeTimeDisplay) {
      resumeTimeDisplay.textContent = formatDisplayTime(now);
    }
    
    // Tính thời gian nếu cần
    if (typeof calculateDuration === 'function') {
      calculateDuration();
    }
    
    console.log("Đã xử lý chạy lại máy thành công");
    return false;
  };
  
  // Thêm hàm xử lý form chính
  window.handleConfirmButtonClick = function(event) {
    // Ngăn chặn tất cả hành vi mặc định
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Ghi lại thời gian kết thúc
    document.body.setAttribute('data-end-time', new Date().toISOString());
    
    // Xác nhận trước khi gửi
    // if (confirm('Bạn có chắc chắn muốn xác nhận báo cáo này?')) {
    //   if (typeof submitReport === 'function') {
    //     submitReport();
    //   } else {
    //     console.error("Không tìm thấy hàm submitReport");
    //   }
    // }
    
    return false;
  };
  
  // Bắt đầu xử lý DOM khi tài liệu đã tải xong
  document.addEventListener('DOMContentLoaded', function() {
    // Sửa nút dừng máy - cách đơn giản nhất
    const stopTimeButton = document.getElementById('stopTimeButton');
    if (stopTimeButton) {
      // Xóa tất cả event listener cũ
      const newStopTimeButton = document.createElement('button');
      
      // Sao chép thuộc tính
      for (let i = 0; i < stopTimeButton.attributes.length; i++) {
        const attr = stopTimeButton.attributes[i];
        newStopTimeButton.setAttribute(attr.name, attr.value);
      }
      
      // Thiết lập nội dung và thuộc tính quan trọng
      newStopTimeButton.innerHTML = stopTimeButton.innerHTML;
      newStopTimeButton.className = stopTimeButton.className;
      newStopTimeButton.id = stopTimeButton.id;
      newStopTimeButton.type = 'button'; // Đảm bảo là type button
      
      // Gán sự kiện trực tiếp thay vì addEventListener
      newStopTimeButton.onclick = function(e) {
        // Gọi hàm xử lý riêng biệt
        return window.handleStopButtonClick(e);
      };
      
      // Thay thế nút cũ
      if (stopTimeButton.parentNode) {
        stopTimeButton.parentNode.replaceChild(newStopTimeButton, stopTimeButton);
      }
    }
    
    // Tương tự với nút chạy lại
    const resumeTimeButton = document.getElementById('resumeTimeButton');
    if (resumeTimeButton) {
      // Xóa tất cả event listener cũ
      const newResumeTimeButton = document.createElement('button');
      
      // Sao chép thuộc tính
      for (let i = 0; i < resumeTimeButton.attributes.length; i++) {
        const attr = resumeTimeButton.attributes[i];
        newResumeTimeButton.setAttribute(attr.name, attr.value);
      }
      
      // Thiết lập nội dung và thuộc tính quan trọng
      newResumeTimeButton.innerHTML = resumeTimeButton.innerHTML;
      newResumeTimeButton.className = resumeTimeButton.className;
      newResumeTimeButton.id = resumeTimeButton.id;
      newResumeTimeButton.type = 'button'; // Đảm bảo là type button
      
      // Gán sự kiện trực tiếp thay vì addEventListener
      newResumeTimeButton.onclick = function(e) {
        // Gọi hàm xử lý riêng biệt
        return window.handleResumeButtonClick(e);
      };
      
      // Thay thế nút cũ
      if (resumeTimeButton.parentNode) {
        resumeTimeButton.parentNode.replaceChild(newResumeTimeButton, resumeTimeButton);
      }
    }
    
    // Tương tự với nút xác nhận báo cáo
    const confirmButton = document.querySelector('.row .col-12 .btn-primary');
    if (confirmButton) {
      // Xóa tất cả event listener cũ
      const newConfirmButton = document.createElement('button');
      
      // Sao chép thuộc tính
      for (let i = 0; i < confirmButton.attributes.length; i++) {
        const attr = confirmButton.attributes[i];
        newConfirmButton.setAttribute(attr.name, attr.value);
      }
      
      // Thiết lập nội dung và thuộc tính quan trọng
      newConfirmButton.innerHTML = confirmButton.innerHTML;
      newConfirmButton.className = confirmButton.className;
      newConfirmButton.id = 'confirmReportBtn';
      newConfirmButton.type = 'button'; // Đảm bảo là type button
      
      // Gán sự kiện trực tiếp thay vì addEventListener
      newConfirmButton.onclick = function(e) {
        // Gọi hàm xử lý riêng biệt
        return window.handleConfirmButtonClick(e);
      };
      
      // Thay thế nút cũ
      if (confirmButton.parentNode) {
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
      }
    }
    
    // Ngăn chặn submit form
    window.addEventListener('submit', function(event) {
      event.preventDefault();
      console.log('Đã chặn form submit');
      return false;
    }, true);
  });


  //!==================================================================================================================================

  //! XỬ LÝ VỊ TRÍ
  document.addEventListener('DOMContentLoaded', function() {
    // Lấy các elements cho vị trí và input tương ứng
    const viTri1Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(1) input');
    const viTri2Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(2) input');
    const viTri3Input = document.querySelector('.row.g-2.mb-4 .col-md-4:nth-child(3) input');
    
    const viTri1Select = document.getElementById('viTri1Select');
    const viTri2Select = document.getElementById('viTri2Select');
    const viTri3Select = document.getElementById('viTri3Select');
    
    // Tạo các tùy chọn mặc định cho các select
    if (viTri1Select && viTri2Select && viTri3Select) {
      // Xóa tất cả các options hiện có
      while (viTri1Select.options.length) viTri1Select.remove(0);
      while (viTri2Select.options.length) viTri2Select.remove(0);
      while (viTri3Select.options.length) viTri3Select.remove(0);
      
      // Thêm option mặc định cho từng select
      const defaultOption = document.createElement('option');
      defaultOption.value = "";
      defaultOption.textContent = "-- Chọn vị trí --";
      viTri1Select.appendChild(defaultOption.cloneNode(true));
      viTri2Select.appendChild(defaultOption.cloneNode(true));
      viTri3Select.appendChild(defaultOption.cloneNode(true));
      
      // Thêm các options A, B, C cho mỗi select
      const positions = [
        { value: "A", text: "Vị trí A" },
        { value: "B", text: "Vị trí B" },
        { value: "C", text: "Vị trí C" }
      ];
      
      positions.forEach(pos => {
        const option = document.createElement('option');
        option.value = pos.value;
        option.textContent = pos.text;
        viTri1Select.appendChild(option.cloneNode(true));
        viTri2Select.appendChild(option.cloneNode(true));
        viTri3Select.appendChild(option.cloneNode(true));
      });
      
      // Thiết lập trạng thái ban đầu
      updateSelectState();
      
      // Thêm sự kiện khi thay đổi giá trị input
      if (viTri1Input) viTri1Input.addEventListener('input', updateSelectState);
      if (viTri2Input) viTri2Input.addEventListener('input', updateSelectState);
      if (viTri3Input) viTri3Input.addEventListener('input', updateSelectState);
      
      // Thêm sự kiện khi thay đổi select
      viTri1Select.addEventListener('change', function() {
        // Đảm bảo giá trị được chọn và hiển thị
        if (this.selectedIndex > 0) {
          console.log("Chọn vị trí 1:", this.value);
          // Đảm bảo giá trị được thiết lập đúng
          setTimeout(() => {
            if (this.selectedIndex === 0) {
              // Nếu vẫn hiển thị mặc định, chọn lại
              this.selectedIndex = Array.from(this.options).findIndex(opt => opt.value === this.value) || 1;
            }
          }, 10);
        }
        updateAvailableOptions();
        updateProgress(); // Cập nhật tiến độ nếu có
      });
      
      viTri2Select.addEventListener('change', function() {
        // Đảm bảo giá trị được chọn và hiển thị
        if (this.selectedIndex > 0) {
          console.log("Chọn vị trí 2:", this.value);
          // Đảm bảo giá trị được thiết lập đúng
          setTimeout(() => {
            if (this.selectedIndex === 0) {
              // Nếu vẫn hiển thị mặc định, chọn lại
              this.selectedIndex = Array.from(this.options).findIndex(opt => opt.value === this.value) || 1;
            }
          }, 10);
        }
        updateAvailableOptions();
        updateProgress(); // Cập nhật tiến độ nếu có
      });
      
      viTri3Select.addEventListener('change', function() {
        // Đảm bảo giá trị được chọn và hiển thị
        if (this.selectedIndex > 0) {
          console.log("Chọn vị trí 3:", this.value);
          // Đảm bảo giá trị được thiết lập đúng
          setTimeout(() => {
            if (this.selectedIndex === 0) {
              // Nếu vẫn hiển thị mặc định, chọn lại
              this.selectedIndex = Array.from(this.options).findIndex(opt => opt.value === this.value) || 1;
            }
          }, 10);
        }
        updateAvailableOptions();
        updateProgress(); // Cập nhật tiến độ nếu có
      });
    }
    
    // Hàm cập nhật trạng thái của các select dựa trên input
    function updateSelectState() {
      const isPendingFormula = document.body.hasAttribute('data-need-formula-update');
      
      // Vô hiệu hóa select nếu input tương ứng trống và không phải phiếu bổ sung sau
      if (viTri1Select && viTri1Input) {
          viTri1Select.disabled = !viTri1Input.value.trim() && !isPendingFormula;
      }
      
      if (viTri2Select && viTri2Input) {
          viTri2Select.disabled = !viTri2Input.value.trim() && !isPendingFormula;
      }
      
      if (viTri3Select && viTri3Input) {
          viTri3Select.disabled = !viTri3Input.value.trim() && !isPendingFormula;
      }
      
      // Cập nhật các tùy chọn có sẵn
      updateAvailableOptions();
  }
    
    // Hàm cập nhật các tùy chọn có sẵn cho mỗi select
    function updateAvailableOptions() {
      // Lấy các giá trị đã chọn
      const selectedPositions = [
        viTri1Select.value,
        viTri2Select.value,
        viTri3Select.value
      ].filter(val => val); // Lọc ra các giá trị không trống
      
      // Danh sách tất cả các vị trí
      const allPositions = ["A", "B", "C"];
      
      // Cập nhật các tùy chọn cho từng select
      updateOptionsForSelect(viTri1Select, selectedPositions, allPositions, viTri1Input);
      updateOptionsForSelect(viTri2Select, selectedPositions, allPositions, viTri2Input);
      updateOptionsForSelect(viTri3Select, selectedPositions, allPositions, viTri3Input);
    }
    
    // Hàm cập nhật tùy chọn cho một select cụ thể
    function updateOptionsForSelect(select, selectedPositions, allPositions, input) {
      // Nếu select bị vô hiệu hóa hoặc không tồn tại, không làm gì cả
      if (!select || select.disabled) return;
      
      // Lưu giá trị hiện tại
      const currentValue = select.value;
      
      // Xóa tất cả options trừ option mặc định
      while (select.options.length > 1) {
        select.remove(1);
      }
      
      // Thêm chỉ những tùy chọn không bị chọn bởi các select khác
      allPositions.forEach(pos => {
        // Nếu vị trí này chưa được chọn hoặc là vị trí hiện tại của select này
        if (!selectedPositions.includes(pos) || pos === currentValue) {
          const option = document.createElement('option');
          option.value = pos;
          option.textContent = `Vị trí ${pos}`;
          select.appendChild(option);
        }
      });
      
      // Giữ nguyên giá trị đã chọn nếu vẫn hợp lệ
      if (currentValue && (allPositions.includes(currentValue) && (!selectedPositions.includes(currentValue) || currentValue === select.value))) {
        select.value = currentValue;
      } else if (currentValue) {
        // Nếu giá trị hiện tại không còn hợp lệ, đặt giá trị là option đầu tiên có sẵn
        if (select.options.length > 1) {
          select.selectedIndex = 1; // Chọn option đầu tiên sau option mặc định
        }
      }
      
      // Đảm bảo hiển thị đúng giá trị đã chọn
      console.log("Select:", select.id, "Value:", select.value, "Text:", select.options[select.selectedIndex].textContent);
    }
  });


  // Hàm giúp khắc phục lỗi giá trị select không hiển thị đúng
function fixViTriSelectDisplay() {
    const viTriSelects = [
      document.getElementById('viTri1Select'),
      document.getElementById('viTri2Select'),
      document.getElementById('viTri3Select')
    ];
  
    viTriSelects.forEach((select, index) => {
      if (!select) return;
  
      // Thay thế select bằng một select mới để tránh sự cố event
      const newSelect = document.createElement('select');
      
      // Sao chép tất cả thuộc tính
      Array.from(select.attributes).forEach(attr => {
        newSelect.setAttribute(attr.name, attr.value);
      });
  
      // Sao chép tất cả options
      Array.from(select.options).forEach(opt => {
        const newOpt = document.createElement('option');
        newOpt.value = opt.value;
        newOpt.textContent = opt.textContent;
        if (opt.selected) newOpt.selected = true;
        newSelect.appendChild(newOpt);
      });
  
      // Đảm bảo select có cùng classes
      newSelect.className = select.className;
      
      // Thêm event listener mới
      newSelect.addEventListener('change', function(e) {
        console.log(`Chọn ${this.id}:`, this.value);
        
        // Đảm bảo giá trị được hiển thị đúng
        if (this.value) {
          const selectedIndex = Array.from(this.options).findIndex(opt => opt.value === this.value);
          if (selectedIndex > 0) {
            this.selectedIndex = selectedIndex;
          }
        }
        
        // Cập nhật các options cho các select khác
        setTimeout(() => {
          updateSelectOptions();
        }, 10);
        
        // Cập nhật tiến độ nếu cần
        if (typeof updateProgress === 'function') {
          updateProgress();
        }
      });
      
      // Thay thế select cũ
      select.parentNode.replaceChild(newSelect, select);
    });
    
    // Hàm cập nhật các options giữa các select
    function updateSelectOptions() {
      // Lấy các select mới
      const selects = [
        document.getElementById('viTri1Select'),
        document.getElementById('viTri2Select'),
        document.getElementById('viTri3Select')
      ];
      
      // Danh sách các vị trí đã chọn
      const selectedPositions = selects.map(s => s.value).filter(v => v);
      console.log("Vị trí đã chọn:", selectedPositions);
      
      // Danh sách tất cả vị trí
      const allPositions = ["A", "B", "C"];
      
      // Cập nhật options cho mỗi select
      selects.forEach((select, i) => {
        // Lưu lại giá trị hiện tại
        const currentValue = select.value;
        
        // Không làm gì nếu select bị vô hiệu hóa
        if (select.disabled) return;
        
        // Lưu lại option đầu tiên (mặc định)
        const defaultOption = select.options[0];
        
        // Xóa tất cả options trừ option mặc định
        while (select.options.length > 1) {
          select.remove(1);
        }
        
        // Thêm lại các options phù hợp
        allPositions.forEach(pos => {
          // Chỉ thêm nếu vị trí này chưa được chọn hoặc đang là vị trí hiện tại của select này
          if (!selectedPositions.includes(pos) || pos === currentValue) {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = `Vị trí ${pos}`;
            select.appendChild(option);
          }
        });
        
        // Giữ lại giá trị đã chọn nếu có thể
        if (currentValue) {
          const optionExists = Array.from(select.options).some(opt => opt.value === currentValue);
          if (optionExists) {
            select.value = currentValue;
          }
        }
      });
    }
  }
  
  // Gọi hàm này sau khi DOM đã tải xong
  document.addEventListener('DOMContentLoaded', function() {
    // Đặt timeout để đảm bảo các select đã được khởi tạo
    setTimeout(fixViTriSelectDisplay, 1000);
  });
  
  // Thêm sự kiện cho nút tabs để sửa lại khi chuyển tab
  document.querySelectorAll('.nav-link').forEach(tab => {
    tab.addEventListener('click', function() {
      // Đợi một chút để DOM cập nhật sau khi chuyển tab
      setTimeout(fixViTriSelectDisplay, 500);
    });
  });

  //!==================================================================================================================================
  
//   ! FIX LỖI PHẦN DỪNG MÁY
document.addEventListener('DOMContentLoaded', function() {
    // Sửa lỗi nút thời gian dừng máy
    function fixStopButtons() {
      // Sửa nút thời gian dừng máy
      const stopTimeButton = document.getElementById('stopTimeButton');
      const resumeTimeButton = document.getElementById('resumeTimeButton');
      
      // Nếu nút tồn tại, cập nhật lại style và sự kiện
      if (stopTimeButton) {
        // Đảm bảo nút hiển thị rõ ràng và có thể bấm được
        stopTimeButton.style.opacity = '1';
        stopTimeButton.style.display = 'block';
        // stopTimeButton.style.pointerEvents = 'auto';
        stopTimeButton.style.cursor = 'pointer';
        stopTimeButton.disabled = false;
        
        // Xóa sự kiện cũ và thêm sự kiện mới
        const newStopTimeButton = stopTimeButton.cloneNode(true);
        newStopTimeButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          // Thiết lập thời gian dừng máy
          const now = new Date();
          const stopTimeInput = document.getElementById('stopTimeInput');
          if (stopTimeInput) {
            stopTimeInput.value = formatDateTimeForInput(now);
          }
          
          // Ẩn nút sau khi bấm
          this.style.display = 'none';
          
          // Hiển thị thời gian
          const stopTimeDisplay = document.getElementById('stopTimeDisplay');
          if (stopTimeDisplay) {
            stopTimeDisplay.textContent = formatDisplayTime(now);
          }
          
          // Tính thời gian dừng máy
          if (typeof calculateDuration === 'function') {
            calculateDuration();
          }
          
          // Kiểm tra hiển thị nút thêm lý do
        //   if (typeof window.checkShowAddReasonButton === 'function') {
        //     window.checkShowAddReasonButton();
        //   }
          
          // Cập nhật tiến độ
          if (typeof updateProgress === 'function') {
            updateProgress();
          }
          
          return false;
        });
        
        // Thay thế nút cũ
        if (stopTimeButton.parentNode) {
          stopTimeButton.parentNode.replaceChild(newStopTimeButton, stopTimeButton);
        }
      }
      
      // Tương tự với nút chạy lại để đảm bảo nhất quán
      if (resumeTimeButton) {
        resumeTimeButton.style.opacity = '1';
        resumeTimeButton.style.pointerEvents = 'auto';
        resumeTimeButton.disabled = false;
        
        const newResumeTimeButton = resumeTimeButton.cloneNode(true);
        newResumeTimeButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const now = new Date();
          const resumeTimeInput = document.getElementById('resumeTimeInput');
          if (resumeTimeInput) {
            resumeTimeInput.value = formatDateTimeForInput(now);
          }
          
          this.style.display = 'none';
          
          const resumeTimeDisplay = document.getElementById('resumeTimeDisplay');
          if (resumeTimeDisplay) {
            resumeTimeDisplay.textContent = formatDisplayTime(now);
          }
          
          if (typeof calculateDuration === 'function') {
            calculateDuration();
          }
          
        //   if (typeof window.checkShowAddReasonButton === 'function') {
        //     // window.checkShowAddReasonButton();
        //   }
          
          if (typeof updateProgress === 'function') {
            updateProgress();
          }
          
          return false;
        });
        
        if (resumeTimeButton.parentNode) {
          resumeTimeButton.parentNode.replaceChild(newResumeTimeButton, resumeTimeButton);
        }
      }
    }
    
    // Sửa lỗi hiển thị cho các nút khi chọn lý do dừng máy
    function fixStopReasonVisibility() {
      const stopReason = document.getElementById('stopReason');
      if (stopReason) {
        // Thêm sự kiện mới cho select lý do dừng máy
        stopReason.addEventListener('change', function() {
          const timeInputs = document.querySelectorAll('.time-inputs');
          const additionalFields = document.querySelector('.additional-fields');
          
          if (this.value) {
            // Hiển thị các trường thời gian và trường bổ sung
            timeInputs.forEach(input => {
              input.style.display = 'block';
            });
            
            // Đảm bảo nút dừng máy và chạy lại hiển thị rõ
            const stopTimeButton = document.getElementById('stopTimeButton');
            const resumeTimeButton = document.getElementById('resumeTimeButton');
            
            if (stopTimeButton && !stopTimeButton.value) {
              stopTimeButton.style.display = 'block';
              stopTimeButton.style.opacity = '1';
              stopTimeButton.style.pointerEvents = 'auto';
              stopTimeButton.disabled = false;
            }
            
            if (resumeTimeButton && !resumeTimeButton.value) {
              resumeTimeButton.style.display = 'block';
              resumeTimeButton.style.opacity = '1';
              resumeTimeButton.style.pointerEvents = 'auto';
              resumeTimeButton.disabled = false;
            }
            
            if (additionalFields) {
              additionalFields.style.display = 'flex';
            }
          } else {
            // Ẩn các trường nếu không chọn lý do
            timeInputs.forEach(input => {
              input.style.display = 'none';
            });
            
            if (additionalFields) {
              additionalFields.style.display = 'none';
            }
          }
          
          // Cập nhật tiến độ
          if (typeof updateProgress === 'function') {
            updateProgress();
          }
        });
      }
    }
    
    // Gọi các hàm sửa lỗi khi trang đã tải xong
    fixStopButtons();
    fixStopReasonVisibility();
    
    // Đồng thời thiết lập một kiểm tra định kỳ để đảm bảo nút luôn hoạt động
    setInterval(function() {
      const stopTimeButton = document.getElementById('stopTimeButton');
      const stopTimeInput = document.getElementById('stopTimeInput');
      
      // Chỉ hiển thị nút nếu input chưa có giá trị
      if (stopTimeButton && stopTimeInput && !stopTimeInput.value) {
        stopTimeButton.style.display = 'block';
        stopTimeButton.style.opacity = '1';
        stopTimeButton.style.pointerEvents = 'auto';
        stopTimeButton.disabled = false;
      }
    }, 2000); // Kiểm tra mỗi 2 giây
    
    // Thêm sự kiện cho nút "Có" dừng máy để đảm bảo hiển thị đúng trạng thái
    const btnYes = document.getElementById('btnYes');
    if (btnYes) {
      btnYes.addEventListener('click', function() {
        setTimeout(function() {
          fixStopButtons();
          fixStopReasonVisibility();
        }, 100);
      });
    }
  });



  // Hàm để hiển thị các trường thời gian khi select lý do thay đổi
function showTimeInputsForReason(reasonSelect) {
    if (!reasonSelect) return;
    
    // Tìm container cha
    const container = reasonSelect.closest('.stop-reason-container') || 
                     reasonSelect.closest('#machineReport');
    
    if (!container) return;
    
    // Tìm các phần tử time inputs và additional fields
    const timeInputs = container.querySelectorAll('[class*="time-inputs"]');
    const additionalFields = container.querySelector('[class*="additional-fields"]');
    
    // Hiển thị hoặc ẩn dựa trên giá trị của select
    if (reasonSelect.value) {
      // Có lý do, hiển thị các trường thời gian
      timeInputs.forEach(input => {
        input.style.display = 'block';
      });
      
      if (additionalFields) {
        additionalFields.style.display = 'flex';
      }
    } else {
      // Không có lý do, ẩn các trường thời gian
      timeInputs.forEach(input => {
        input.style.display = 'none';
      });
      
      if (additionalFields) {
        additionalFields.style.display = 'none';
      }
    }
  }
  
  // Hàm thiết lập sự kiện cho các select lý do
  function setupReasonSelectEvents() {
    // Thiết lập cho select lý do chính
    const mainReason = document.getElementById('stopReason');
    if (mainReason) {
      mainReason.addEventListener('change', function() {
        showTimeInputsForReason(this);
      });
    }
    
    // Thiết lập cho tất cả các select lý do khác
    const allReasonSelects = document.querySelectorAll('.stop-reason-select');
    allReasonSelects.forEach(select => {
      if (select !== mainReason) {
        select.addEventListener('change', function() {
          showTimeInputsForReason(this);
        });
      }
    });
  }
  
  // Thêm một hàm để thiết lập sự kiện hộp chọn lý do mới
  function setupNewReasonSelectEvents() {
    // Tìm tất cả select lý do mới
    const newReasonSelects = document.querySelectorAll('.stop-reason-select');
    
    newReasonSelects.forEach(select => {
      // Kiểm tra xem đã có sự kiện chưa
      const hasEvent = select._hasChangeEvent;
      
      if (!hasEvent) {
        select.addEventListener('change', function() {
          console.log("Lý do thay đổi:", this.value);
          showTimeInputsForReason(this);
        });
        
        // Đánh dấu đã thêm sự kiện
        select._hasChangeEvent = true;
      }
    });
  }
  
  // Gắn sự kiện cho nút dừng máy để tự động thiết lập sự kiện cho các select mới
  document.getElementById('btnYes')?.addEventListener('click', function() {
    // Thiết lập sự kiện sau khi báo cáo dừng máy hiển thị
    setTimeout(setupReasonSelectEvents, 300);
  });
  
  // Thêm một hàm giúp kiểm tra và thiết lập sự kiện cho lý do mới
  function observeNewReasons() {
    // Sử dụng MutationObserver để theo dõi các thay đổi trong DOM
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Nếu có node mới được thêm vào
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.classList && node.classList.contains('stop-reason-container')) {
              // Nếu là container lý do dừng máy mới
              console.log("Phát hiện lý do dừng máy mới:", node.id);
              const select = node.querySelector('.stop-reason-select');
              if (select) {
                select.addEventListener('change', function() {
                  console.log("Lý do thay đổi:", this.value);
                  showTimeInputsForReason(this);
                });
              }
            }
          });
        }
      });
    });
    
    // Bắt đầu theo dõi #additionalReasonsContainer
    const container = document.getElementById('additionalReasonsContainer');
    if (container) {
      observer.observe(container, { childList: true });
      console.log("Đã bắt đầu theo dõi thay đổi trong additionalReasonsContainer");
    }
  }
  
  // Khởi tạo khi tài liệu đã sẵn sàng
  document.addEventListener('DOMContentLoaded', function() {
    setupReasonSelectEvents();
    observeNewReasons();
    
    // Kiểm tra ban đầu
    const mainReason = document.getElementById('stopReason');
    if (mainReason) {
      showTimeInputsForReason(mainReason);
    }
  });
  
  // Sửa lỗi khi chọn lý do dừng máy tiếp theo không hiển thị trường thời gian
function fixDungMayTimeInputsVisibility() {
    // Tìm tất cả các container lý do dừng máy
    const reasonContainers = document.querySelectorAll('.stop-reason-container');
    
    reasonContainers.forEach(container => {
      const reasonSelect = container.querySelector('select');
      
      if (reasonSelect) {
        // Xóa sự kiện cũ và gắn sự kiện mới
        const newReasonSelect = reasonSelect.cloneNode(true);
        
        newReasonSelect.addEventListener('change', function(e) {
          // Tìm các phần tử thời gian và trường bổ sung trong container này
          // Sử dụng class có chứa "time-inputs" hoặc "additional-fields" để tránh xung đột
          const containerId = container.id || '';
          const index = containerId.split('-')[1] || '';
          
          const timeInputs = container.querySelectorAll(`[class*="time-inputs"]`);
          const additionalFields = container.querySelector(`[class*="additional-fields"]`);
          
          if (this.value) {
            // Nếu đã chọn lý do, hiển thị các trường
            timeInputs.forEach(input => {
              input.style.display = 'block';
            });
            
            if (additionalFields) {
              additionalFields.style.display = 'flex';
            }
          } else {
            // Nếu chưa chọn lý do, ẩn các trường
            timeInputs.forEach(input => {
              input.style.display = 'none';
            });
            
            if (additionalFields) {
              additionalFields.style.display = 'none';
            }
          }
          
          // Cập nhật tiến độ nếu cần
          if (typeof updateProgress === 'function') {
            updateProgress();
          }
        });
        
        // Thay thế select cũ bằng select mới
        if (reasonSelect.parentNode) {
          reasonSelect.parentNode.replaceChild(newReasonSelect, reasonSelect);
        }
      }
    });
  }

  function fixDuplicateStopReports() {
    // Ghi đè hàm collectReportData gốc (chỉ sửa phần thu thập dữ liệu báo cáo dừng máy)
    window.originalCollectReportData = window.collectReportData || collectReportData;
    
    // Thay thế hàm gốc bằng phiên bản đã sửa
    window.collectReportData = function() {
      try {
        // Gọi hàm gốc để lấy dữ liệu báo cáo
        const reportData = window.originalCollectReportData();
        
        // Nếu không có dữ liệu hoặc không có báo cáo dừng máy, trả về dữ liệu gốc
        if (!reportData || !reportData.dungMay || reportData.dungMay.length <= 1) {
          return reportData;
        }
        
        console.log("Trước khi xử lý: " + reportData.dungMay.length + " báo cáo dừng máy");
        
        // Kiểm tra và loại bỏ các báo cáo dừng máy trùng lặp
        const uniqueStopReports = [];
        const seenKeys = new Set();
        
        reportData.dungMay.forEach(report => {
          // Tạo khóa duy nhất cho mỗi báo cáo dừng máy dựa trên dữ liệu
          const key = `${report.lyDo}_${report.thoiGianDung}_${report.thoiGianChayLai}`;
          
          // Chỉ thêm vào danh sách nếu chưa gặp phải khóa này
          if (!seenKeys.has(key)) {
            uniqueStopReports.push(report);
            seenKeys.add(key);
          }
        });
        
        console.log("Sau khi xử lý: " + uniqueStopReports.length + " báo cáo dừng máy");
        
        // Cập nhật dữ liệu báo cáo với danh sách đã lọc
        reportData.dungMay = uniqueStopReports;
        
        return reportData;
      } catch (error) {
        console.error("Lỗi khi thu thập dữ liệu báo cáo:", error);
        // Nếu có lỗi, trả về kết quả từ hàm gốc
        return window.originalCollectReportData();
      }
    };
  }
  
  // Khởi tạo sửa lỗi khi trang đã tải xong
  document.addEventListener('DOMContentLoaded', function() {
    // Thiết lập MutationObserver để theo dõi thay đổi DOM
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Nếu có DOM mới được thêm vào, kiểm tra nếu có container lý do dừng máy mới
          const hasNewReasonContainer = Array.from(mutation.addedNodes).some(node => 
            node.nodeType === 1 && 
            (node.classList && node.classList.contains('stop-reason-container') || 
             node.querySelector && node.querySelector('.stop-reason-container'))
          );
          
          if (hasNewReasonContainer) {
            console.log("Phát hiện container lý do dừng máy mới, đang sửa lỗi hiển thị...");
            setTimeout(fixDungMayTimeInputsVisibility, 10);
          }
        }
      });
    });
    
    // Bắt đầu theo dõi document.body và các thay đổi con của nó
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Sửa lỗi ngay khi trang tải xong
    setTimeout(function() {
      fixDungMayTimeInputsVisibility();
      fixDuplicateStopReports();
    }, 1000);
    
    // Sửa lỗi khi chuyển tab
    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
      tab.addEventListener('click', function() {
        setTimeout(fixDungMayTimeInputsVisibility, 500);
      });
    });
    
    // Sửa lỗi khi nhấn nút "Có" dừng máy
    const btnYes = document.getElementById('btnYes');
    if (btnYes) {
      btnYes.addEventListener('click', function() {
        setTimeout(fixDungMayTimeInputsVisibility, 300);
      });
    }
    
    // Ghi đè lên window.handleAddReasonButtonClick để sửa lỗi khi thêm lý do mới
    const originalHandleAddReasonButton = window.handleAddReasonButtonClick;
    if (originalHandleAddReasonButton) {
      window.handleAddReasonButtonClick = function(e) {
        const result = originalHandleAddReasonButton(e);
        
        // Sau khi thêm lý do mới, sửa lỗi hiển thị
        setTimeout(fixDungMayTimeInputsVisibility, 10);
        
        return result;
      };
    }
    
    console.log("Đã cài đặt các bản sửa lỗi cho chức năng dừng máy");
  });

  //!==================================================================================================================================
  
  //! CỐ ĐỊNH CỘT 
// Thêm CSS cho cố định hàng tiêu đề và cột
const fixedTableStyles = `
/* Styles cho cố định hàng tiêu đề */
.table-fixed-header {
  position: relative;
}

.table-fixed-header thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f9fa;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

/* Styles cho cố định cột - SỬA: Cải thiện spacing */
.table-fixed-columns {
  position: relative;
}

.table-fixed-columns .fixed-column {
  position: sticky;
  z-index: 2;
  background-color: #fff;
  border-right: 2px solid #dee2e6 !important; /* Thêm border để phân cách rõ ràng */
}

/* SỬA: Định nghĩa lại vị trí left cho từng cột với khoảng cách hợp lý */
.table-fixed-columns .fixed-column:nth-child(1) { 
  left: 0; 
  min-width: 120px !important; /* Cột thao tác */
}
.table-fixed-columns .fixed-column:nth-child(2) { 
  left: 120px; 
  min-width: 60px !important; /* Cột STT */
}
.table-fixed-columns .fixed-column:nth-child(3) { 
  left: 180px; 
  min-width: 150px !important; /* Cột Ca + Người */
}
.table-fixed-columns .fixed-column:nth-child(4) { 
  left: 330px; 
  min-width: 100px !important; /* Cột Ngày */
}
.table-fixed-columns .fixed-column:nth-child(5) { 
  left: 430px; 
  min-width: 120px !important; /* Cột Số phiếu */
}
.table-fixed-columns .fixed-column:nth-child(6) { 
  left: 550px; 
  min-width: 80px !important; /* Cột Số lần */
}
.table-fixed-columns .fixed-column:nth-child(7) { 
  left: 630px; 
  min-width: 120px !important; /* Cột Worksheet */
}

/* Thêm shadow cho cột cố định cuối cùng để phân biệt với các cột khác */
.table-fixed-columns .fixed-column:nth-child(7) {
  box-shadow: 6px 0 8px -6px rgba(0, 0, 0, 0.15);
}

/* Khi cả header và column đều cố định, hãy đảm bảo header của các cột cố định nằm trên cùng */
.table-fixed-header.table-fixed-columns thead th.fixed-column {
  z-index: 20;
  background-color: rgb(0, 138, 176);
  color: white;
  border-right: 2px solid #ffffff !important; /* Border trắng cho header */
}

/* SỬA: Đảm bảo các cột cố định có width tối thiểu */
.table-fixed-columns .fixed-column {
  white-space: nowrap; /* Không wrap text */
  overflow: hidden;
  text-overflow: ellipsis; /* Hiển thị ... khi text quá dài */
}

/* Đảm bảo bảng có thanh cuộn ngang */
.table-responsive {
  overflow-x: auto;
  max-height: 75vh; /* Giới hạn chiều cao để có thể cuộn dọc */
}

/* SỬA: Thêm style cho toàn bộ bảng khi có cột cố định */
.table-fixed-columns table {
  table-layout: auto; /* Cho phép bảng tự điều chỉnh kích thước */
  min-width: 100%; /* Đảm bảo bảng có chiều rộng tối thiểu */
}

/* SỬA: Style cho các nút trong cột thao tác */
.table-fixed-columns .fixed-column:nth-child(1) .btn {
  margin: 1px; /* Khoảng cách giữa các nút */
  padding: 2px 6px; /* Giảm padding để nút gọn hơn */
  font-size: 12px; /* Giảm font size */
}

/* SỬA: Đảm bảo text trong các cột cố định hiển thị đầy đủ */
.table-fixed-columns .fixed-column {
  vertical-align: middle; /* Căn giữa theo chiều dọc */
}
`;


// Thêm CSS vào trang
function addFixedTableStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = fixedTableStyles;
  document.head.appendChild(styleElement);
  console.log("Đã thêm styles cho bảng cố định");
}

// Hàm cố định hàng tiêu đề cho tất cả bảng
function fixTableHeaders() {
  // Áp dụng cho bảng báo cáo SCL
  const sclTable = document.querySelector('#nav-danhsachscl .table');
  if (sclTable) {
    sclTable.classList.add('table-fixed-header');
    console.log("Đã cố định hàng tiêu đề cho bảng báo cáo SCL");
  }
  
  // Áp dụng cho bảng báo cáo dừng máy
  const dungMayTable = document.querySelector('#nav-dungmayscl .table');
  if (dungMayTable) {
    dungMayTable.classList.add('table-fixed-header');
    console.log("Đã cố định hàng tiêu đề cho bảng báo cáo dừng máy");
  }
}

// Hàm bật/tắt cố định cột
function toggleFixedColumns() {
  // Xác định bảng cần áp dụng dựa trên tab đang active
  let targetTable;
  
  if (document.querySelector('#nav-danhsachscl.active') || document.querySelector('[aria-controls="nav-danhsachscl"].active')) {
    targetTable = document.querySelector('#nav-danhsachscl .table');
  } else if (document.querySelector('#nav-dungmayscl.active') || document.querySelector('[aria-controls="nav-dungmayscl"].active')) {
    targetTable = document.querySelector('#nav-dungmayscl .table');
  }
  
  if (!targetTable) {
    console.log("Không tìm thấy bảng để áp dụng cố định cột");
    return;
  }
  
  // Kiểm tra xem bảng đã cố định cột chưa
  const isFixed = targetTable.classList.contains('table-fixed-columns');
  const button = document.getElementById('btnFixColumns');
  
  if (isFixed) {
    // Nếu đã cố định, hủy cố định
    targetTable.classList.remove('table-fixed-columns');
    
    // Loại bỏ class cố định khỏi các ô trong cột
    const fixedColumns = targetTable.querySelectorAll('.fixed-column');
    fixedColumns.forEach(cell => {
      cell.classList.remove('fixed-column');
    });
    
    // Cập nhật text nút
    if (button) {
      button.innerHTML = '<i class="fas fa-thumbtack me-1"></i> Cố định cột';
    }
    console.log("Đã hủy cố định cột");
  } else {
    // Nếu chưa cố định, tiến hành cố định
    targetTable.classList.add('table-fixed-columns');
    
    // Thêm class cố định cho các ô trong 6 cột đầu tiên của bảng báo cáo SCL
    if (targetTable.closest('#nav-danhsachscl')) {
      const rows = targetTable.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        
        // Cố định 7 cột đầu tiên
        for (let i = 0; i < Math.min(7, cells.length); i++) {
          cells[i].classList.add('fixed-column');
        }
      });
    } 
    // Thêm class cố định cho các ô trong 4 cột đầu tiên của bảng báo cáo dừng máy
    else if (targetTable.closest('#nav-dungmayscl')) {
      const rows = targetTable.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        
        // Cố định 4 cột đầu tiên cho bảng dừng máy
        for (let i = 0; i < Math.min(4, cells.length); i++) {
          cells[i].classList.add('fixed-column');
        }
      });
    }
    
    // Cập nhật text nút
    if (button) {
      button.innerHTML = '<i class="fas fa-times me-1"></i> Hủy cố định';
    }
    console.log("Đã cố định cột");
  }
}

// Thiết lập tab change event để đảm bảo cố định header khi chuyển tab
function setupTabEvents() {
  const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
  
  tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', function (event) {
      // Sau khi tab hiển thị, áp dụng lại cố định header
      setTimeout(() => {
        fixTableHeaders();
        
        // Kiểm tra xem nút cố định cột có đang ở trạng thái ON không
        const btnFixColumns = document.getElementById('btnFixColumns');
        if (btnFixColumns && btnFixColumns.innerHTML.includes('Hủy cố định')) {
          // Nếu đang ON, áp dụng cố định cột cho bảng trong tab hiện tại
          toggleFixedColumns();
          toggleFixedColumns(); // Gọi 2 lần để cập nhật trạng thái đúng
        }
      }, 100);
    });
  });
}

// Kết nối nút HTML với hàm toggleFixedColumns
function connectHTMLButton() {
  const htmlButton = document.getElementById('btnFixColumns');
  if (htmlButton) {
    htmlButton.addEventListener('click', function() {
      toggleFixedColumns();
    });
    console.log("Đã kết nối nút HTML với chức năng cố định cột");
  } else {
    console.log("Không tìm thấy nút HTML để kết nối");
  }
}

// Hàm khởi tạo tất cả chức năng
function initFixedTableFeatures() {
  // Thêm CSS
  addFixedTableStyles();
  
  // Cố định header cho tất cả bảng
  fixTableHeaders();
  
  // Kết nối nút HTML với hàm toggleFixedColumns
  connectHTMLButton();
  
  // Thiết lập sự kiện cho tab
  setupTabEvents();
  
  console.log("Đã khởi tạo tất cả chức năng cố định bảng");
}

// Chạy khởi tạo khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', initFixedTableFeatures);

// Tính đến trường hợp script được thêm vào sau khi trang đã tải
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initFixedTableFeatures, 100);
}




  //!==================================================================================================================================