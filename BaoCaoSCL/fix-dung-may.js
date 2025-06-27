// Biến theo dõi số lượng lý do dừng máy hiện tại
let reasonCount = 1;

// Hàm tự động thêm lý do dừng máy mới
function addNewStopReason() {
  // Tăng biến đếm lý do
  reasonCount++;
  const newReasonId = `reason-${reasonCount}`;
  
  // Kiểm tra xem đã có phần tử này chưa
  if (document.getElementById(newReasonId)) return;
  
  console.log("Thêm lý do dừng máy mới:", newReasonId);
  
  // Tạo HTML cho lý do mới
  const newReasonHtml = `
    <div class="stop-reason-container" id="${newReasonId}">
      <hr>
      <div class="row mb-3">
        <div class="col-4">
          <label class="fw-bold mb-1">Lý do dừng máy</label>
          <select class="form-select stop-reason-select">
            <option value="">-- Lý do --</option>
            <option value="Hỏng thiết bị">Hỏng thiết bị</option>
            <option value="Bảo trì định kỳ">Bảo trì định kỳ</option>
            <option value="Mất điện">Mất điện</option>
            <option value="Lỗi kỹ thuật">Lỗi kỹ thuật</option>
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
    console.log("Đã thêm lý do mới và thiết lập sự kiện");
  } else {
    console.error("Không tìm thấy container additionalReasonsContainer");
  }
}

// Thiết lập các event listener cho lý do mới
// function setupNewReasonEvents(reasonId) {
//   const container = document.getElementById(reasonId);
//   if (!container) return;

//   const reasonSelect = container.querySelector('.stop-reason-select');
//   const timeInputs = container.querySelectorAll(`[class*="time-inputs-"]`);
//   const additionalFields = container.querySelector(`[class*="additional-fields-"]`);
//   const stopTimeInput = container.querySelector('.stop-time-input');
//   const resumeTimeInput = container.querySelector('.resume-time-input');
//   const stopTimeButton = container.querySelector('.stop-time-button');
//   const resumeTimeButton = container.querySelector('.resume-time-button');
//   const stopTimeDisplay = container.querySelector('.stop-time-display');
//   const resumeTimeDisplay = container.querySelector('.resume-time-display');
//   const stopDuration = container.querySelector('.stop-duration');
//   const deleteButton = container.querySelector('.delete-reason-btn');

//   // Sự kiện chọn lý do
//   if (reasonSelect) {
//     reasonSelect.addEventListener('change', function() {
//       if (this.value) {
//         timeInputs.forEach(input => {
//           input.style.display = 'block';
//         });
//         if (additionalFields) additionalFields.style.display = 'flex';
//       } else {
//         timeInputs.forEach(input => {
//           input.style.display = 'none';
//         });
//         if (additionalFields) additionalFields.style.display = 'none';
//       }
      
//       // Cập nhật tiến độ nếu cần
//       if (typeof updateProgress === 'function') {
//         updateProgress();
//       }
//     });
//   }

//   // Sự kiện nút thời gian dừng máy
//   if (stopTimeButton) {
//     stopTimeButton.addEventListener('click', function(e) {
//       e.preventDefault();
//       e.stopPropagation();
      
//       const now = new Date();
//       const formattedDateTime = formatDateTimeForInput(now);
//       stopTimeInput.value = formattedDateTime;
//       this.style.display = 'none';
//       if (stopTimeDisplay) stopTimeDisplay.textContent = formatDisplayTime(now);
//       calculateDurationForReason(stopTimeInput, resumeTimeInput, stopDuration);
      
//       // Cập nhật tiến độ nếu cần
//       if (typeof updateProgress === 'function') {
//         updateProgress();
//       }
      
//       return false;
//     });
//   }

//   // Sự kiện nút thời gian chạy lại
//   if (resumeTimeButton) {
//     resumeTimeButton.addEventListener('click', function(e) {
//       e.preventDefault();
//       e.stopPropagation();
      
//       const now = new Date();
//       const formattedDateTime = formatDateTimeForInput(now);
//       resumeTimeInput.value = formattedDateTime;
//       this.style.display = 'none';
//       if (resumeTimeDisplay) resumeTimeDisplay.textContent = formatDisplayTime(now);
//       calculateDurationForReason(stopTimeInput, resumeTimeInput, stopDuration);
      
//       // Cập nhật tiến độ nếu cần
//       if (typeof updateProgress === 'function') {
//         updateProgress();
//       }
      
//       return false;
//     });
//   }

//   // Sự kiện nút xóa
//   if (deleteButton) {
//     deleteButton.addEventListener('click', function(e) {
//       e.preventDefault();
//       e.stopPropagation();
      
//       const reasonId = this.getAttribute('data-reason-id');
//       const reasonEl = document.getElementById(reasonId);
//       if (reasonEl) {
//         reasonEl.remove();
        
//         // Cập nhật tiến độ nếu cần
//         if (typeof updateProgress === 'function') {
//           updateProgress();
//         }
//       }
      
//       return false;
//     });
//   }
// }

// Chức năng mới để kiểm tra và tự động thêm lý do
function checkAndAddNewReason() {
  const stopTimeInput = document.getElementById('stopTimeInput');
  const resumeTimeInput = document.getElementById('resumeTimeInput');
  
  if (stopTimeInput && resumeTimeInput && 
      stopTimeInput.value && resumeTimeInput.value) {
    console.log("Điều kiện đã đủ, đang thêm lý do mới");
    addNewStopReason();
  } else {
    console.log("Điều kiện chưa đủ để thêm lý do mới", {
      stopTimeValue: stopTimeInput?.value,
      resumeTimeValue: resumeTimeInput?.value
    });
  }
}

// Thiết lập kiểm tra tự động khi thời gian được nhập đầy đủ
document.addEventListener('DOMContentLoaded', function() {
  // Xóa bỏ section thêm lý do mới nếu có
  const addReasonSection = document.querySelector('.add-reason-section');
  if (addReasonSection) {
    addReasonSection.style.display = 'none';
  }
  
  console.log("Đã tải trang, thiết lập kiểm tra thời gian");
  
  // Kiểm tra thời gian dừng và thời gian chạy lại
  const stopTimeInput = document.getElementById('stopTimeInput');
  const resumeTimeInput = document.getElementById('resumeTimeInput');
  
  if (stopTimeInput && resumeTimeInput) {
    // Thiết lập sự kiện khi thời gian thay đổi
    stopTimeInput.addEventListener('change', function() {
      console.log("Thời gian dừng đã thay đổi:", this.value);
      setTimeout(function() {
        if (stopTimeInput.value && resumeTimeInput.value) {
          checkAndAddNewReason();
        }
      }, 300);
    });
    
    resumeTimeInput.addEventListener('change', function() {
      console.log("Thời gian chạy lại đã thay đổi:", this.value);
      setTimeout(function() {
        if (stopTimeInput.value && resumeTimeInput.value) {
          checkAndAddNewReason();
        }
      }, 300);
    });
  }
  
  // Ghi đè lên sự kiện tính thời gian
  const originalCalculateDuration = window.calculateDuration;
  window.calculateDuration = function() {
    // Gọi hàm gốc
    if (typeof originalCalculateDuration === 'function') {
      originalCalculateDuration();
    }
    
    // Kiểm tra sau khi tính thời gian
    setTimeout(checkAndAddNewReason, 300);
  };
});