// // Hàm riêng biệt để xử lý thêm lý do dừng máy
window.handleAddReasonButtonClick = function(e) {
  // Ngăn chặn tất cả hành vi mặc định
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
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
        <select class="form-select stop-reason-select">
            <option value="">-- Lý do --</option>
            <option value="Hỏng thiết bị">Hỏng thiết bị</option>
            <option value="Bảo trì định kỳ">Bảo trì định kỳ</option>
            <option value="Mất điện">Mất điện</option>
            <option value="Lỗi kỹ thuật">Lỗi kỹ thuật</option>
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
  
  console.log("Đã thêm lý do dừng máy mới");
  return false;
};

// Hàm chủ động cập nhật nút "Thêm lý do dừng máy"
function fixAddReasonButton() {
  const addReasonBtn = document.getElementById('addReasonBtn');
  if (!addReasonBtn) return false;
  
  console.log("Đang sửa nút thêm lý do dừng máy...");
  
  // Tạo nút mới để thay thế
  const newAddReasonBtn = document.createElement('button');
  
  // Sao chép tất cả thuộc tính
  Array.from(addReasonBtn.attributes).forEach(attr => {
    newAddReasonBtn.setAttribute(attr.name, attr.value);
  });
  
  // Sao chép nội dung và class
  newAddReasonBtn.innerHTML = addReasonBtn.innerHTML;
  newAddReasonBtn.className = addReasonBtn.className;
  newAddReasonBtn.type = 'button'; // Đảm bảo là button type
  
  // Thiết lập sự kiện trực tiếp
  newAddReasonBtn.onclick = window.handleAddReasonButtonClick;
  
  // Thay thế nút cũ bằng nút mới
  if (addReasonBtn.parentNode) {
    addReasonBtn.parentNode.replaceChild(newAddReasonBtn, addReasonBtn);
    console.log("Đã thay thế nút thêm lý do dừng máy thành công");
    return true;
  }
  
  return false;
}

// Sửa thêm hàm thiết lập sự kiện cho các lý do mới
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

//   // Sự kiện nút thời gian dừng máy - SỬA LỖI NÚT KHÔNG MẤT
//   if (stopTimeButton) {
//     stopTimeButton.onclick = function(e) {
//       if (e) {
//         e.preventDefault();
//         e.stopPropagation();
//       }
      
//       const now = new Date();
//       const formattedDateTime = formatDateTimeForInput(now);
//       stopTimeInput.value = formattedDateTime;
      
//       // Ẩn nút ngay lập tức
//       this.style.display = 'none';
      
//       if (stopTimeDisplay) {
//         stopTimeDisplay.textContent = formatDisplayTime(now);
//       }
      
//       // Tính thời gian dừng máy
//       if (stopTimeInput && resumeTimeInput && stopDuration) {
//         if (resumeTimeInput.value) {
//           // Nếu có thời gian chạy lại, tính thời gian dừng máy
//           const stopTime = new Date(stopTimeInput.value);
//           const resumeTime = new Date(resumeTimeInput.value);
          
//           if (resumeTime > stopTime) {
//             const diff = resumeTime - stopTime;
//             const hours = Math.floor(diff / (1000 * 60 * 60));
//             const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//             const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
//             stopDuration.value = `${hours} giờ ${minutes} phút ${seconds} giây`;
//           } else {
//             stopDuration.value = '0 giờ 0 phút 0 giây';
//           }
//         }
//       }
      
//       // Cập nhật tiến độ
//       if (typeof updateProgress === 'function') {
//         updateProgress();
//       }
      
//       return false;
//     };
//   }

//   // Sự kiện nút thời gian chạy lại - SỬA LỖI NÚT KHÔNG MẤT
//   if (resumeTimeButton) {
//     resumeTimeButton.onclick = function(e) {
//       if (e) {
//         e.preventDefault();
//         e.stopPropagation();
//       }
      
//       const now = new Date();
//       const formattedDateTime = formatDateTimeForInput(now);
//       resumeTimeInput.value = formattedDateTime;
      
//       // Ẩn nút ngay lập tức
//       this.style.display = 'none';
      
//       if (resumeTimeDisplay) {
//         resumeTimeDisplay.textContent = formatDisplayTime(now);
//       }
      
//       // Tính thời gian dừng máy
//       if (stopTimeInput && resumeTimeInput && stopDuration) {
//         if (stopTimeInput.value) {
//           // Nếu có thời gian dừng máy, tính thời gian dừng máy
//           const stopTime = new Date(stopTimeInput.value);
//           const resumeTime = new Date(resumeTimeInput.value);
          
//           if (resumeTime > stopTime) {
//             const diff = resumeTime - stopTime;
//             const hours = Math.floor(diff / (1000 * 60 * 60));
//             const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//             const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
//             stopDuration.value = `${hours} giờ ${minutes} phút ${seconds} giây`;
//           } else {
//             stopDuration.value = '0 giờ 0 phút 0 giây';
//           }
//         }
//       }
      
//       // Cập nhật tiến độ
//       if (typeof updateProgress === 'function') {
//         updateProgress();
//       }
      
//       return false;
//     };
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

// Thêm một DOMContentLoaded listener mới để sửa nút
document.addEventListener('DOMContentLoaded', function() {
  // Thử sửa nút ngay khi trang tải xong
  setTimeout(fixAddReasonButton, 500);
  
  // Thử lại sau 1 giây để chắc chắn
  setTimeout(fixAddReasonButton, 1000);
  
  // Thử lại sau 2 giây
  setTimeout(fixAddReasonButton, 2000);
  
  // Cố định lỗi khi tab hiển thị
  const navDungMayTab = document.getElementById('btnYes');
  if (navDungMayTab) {
    navDungMayTab.addEventListener('click', function() {
      // Sửa nút khi hiển thị tab dừng máy
      setTimeout(fixAddReasonButton, 100);
      
      // Sửa các nút thời gian trong báo cáo dừng máy chính
      setTimeout(fixStopTimeButtons, 200);
    });
  }
  
  // Sửa các nút thời gian trong báo cáo dừng máy khi trang tải xong
  setTimeout(fixStopTimeButtons, 500);
});

// Hàm sửa các nút thời gian trong báo cáo dừng máy chính
function fixStopTimeButtons() {
  // Sửa nút thời gian dừng máy
  const stopTimeButton = document.getElementById('stopTimeButton');
  if (stopTimeButton) {
    console.log("Đang sửa nút thời gian dừng máy...");
    
    // Tạo nút mới để thay thế
    const newStopTimeButton = document.createElement('button');
    
    // Sao chép tất cả thuộc tính
    Array.from(stopTimeButton.attributes).forEach(attr => {
      newStopTimeButton.setAttribute(attr.name, attr.value);
    });
    
    // Sao chép nội dung và class
    newStopTimeButton.innerHTML = stopTimeButton.innerHTML;
    newStopTimeButton.className = stopTimeButton.className;
    newStopTimeButton.id = 'stopTimeButton';
    newStopTimeButton.type = 'button'; // Đảm bảo là button type
    
    // Thiết lập sự kiện trực tiếp
    newStopTimeButton.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const stopTimeInput = document.getElementById('stopTimeInput');
      const stopTimeDisplay = document.getElementById('stopTimeDisplay');
      
      const now = new Date();
      const formattedDateTime = formatDateTimeForInput(now);
      if (stopTimeInput) stopTimeInput.value = formattedDateTime;
      this.style.display = 'none';
      if (stopTimeDisplay) stopTimeDisplay.textContent = formatDisplayTime(now);
      
      // Tính thời gian
      if (typeof calculateDuration === 'function') {
        calculateDuration();
      }
      
      // Kiểm tra hiển thị nút thêm lý do
      if (typeof window.checkShowAddReasonButton === 'function') {
        window.checkShowAddReasonButton();
      }
      
      // Cập nhật tiến độ nếu cần
      if (typeof updateProgress === 'function') {
        updateProgress();
      }
      
      console.log("Đã xử lý nút thời gian dừng máy");
      return false;
    };
    
    // Thay thế nút cũ bằng nút mới
    if (stopTimeButton.parentNode) {
      stopTimeButton.parentNode.replaceChild(newStopTimeButton, stopTimeButton);
      console.log("Đã thay thế nút thời gian dừng máy thành công");
    }
  }
  
  // Sửa nút thời gian chạy lại
  const resumeTimeButton = document.getElementById('resumeTimeButton');
  if (resumeTimeButton) {
    console.log("Đang sửa nút thời gian chạy lại...");
    
    // Tạo nút mới để thay thế
    const newResumeTimeButton = document.createElement('button');
    
    // Sao chép tất cả thuộc tính
    Array.from(resumeTimeButton.attributes).forEach(attr => {
      newResumeTimeButton.setAttribute(attr.name, attr.value);
    });
    
    // Sao chép nội dung và class
    newResumeTimeButton.innerHTML = resumeTimeButton.innerHTML;
    newResumeTimeButton.className = resumeTimeButton.className;
    newResumeTimeButton.id = 'resumeTimeButton';
    newResumeTimeButton.type = 'button'; // Đảm bảo là button type
    
    // Thiết lập sự kiện trực tiếp
    newResumeTimeButton.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const resumeTimeInput = document.getElementById('resumeTimeInput');
      const resumeTimeDisplay = document.getElementById('resumeTimeDisplay');
      
      const now = new Date();
      const formattedDateTime = formatDateTimeForInput(now);
      if (resumeTimeInput) resumeTimeInput.value = formattedDateTime;
      this.style.display = 'none';
      if (resumeTimeDisplay) resumeTimeDisplay.textContent = formatDisplayTime(now);
      
      // Tính thời gian
      if (typeof calculateDuration === 'function') {
        calculateDuration();
      }
      
      // Kiểm tra hiển thị nút thêm lý do
      if (typeof window.checkShowAddReasonButton === 'function') {
        window.checkShowAddReasonButton();
      }
      
      // Cập nhật tiến độ nếu cần
      if (typeof updateProgress === 'function') {
        updateProgress();
      }
      
      console.log("Đã xử lý nút thời gian chạy lại");
      return false;
    };
    
    // Thay thế nút cũ bằng nút mới
    if (resumeTimeButton.parentNode) {
      resumeTimeButton.parentNode.replaceChild(newResumeTimeButton, resumeTimeButton);
      console.log("Đã thay thế nút thời gian chạy lại thành công");
    }
  }
}
  
// Helper function đã sẵn có - đảm bảo là chúng hợp lệ
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