/* ==========================================================================
   Tệp: TongHopYKien.js
   Chức năng: Trích xuất và vẽ bảng Ý kiến giám sát (Từ ô D4 của các cá nhân)
   Thiết kế và phát triển: Hoàng Ngọc Lâm
   - Cơ chế: Tự động nội suy giao diện (DOM Injection) và Lazy Load.
   - Fix: Bơm giao diện an toàn kể cả khi thẻ chứa đã tồn tại nhưng rỗng.
========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
    let chKiemTraMenu = setInterval(() => {
        let tabYkienCung = document.getElementById("tabYkien");
        let khuVucTab = document.querySelector("#ungDungChinh .tab-content");
        
        if (tabYkienCung && khuVucTab) {
            clearInterval(chKiemTraMenu);
            khoiTaoGiaoDienYkienGiamSat(tabYkienCung, khuVucTab);
        }
    }, 500);
});

// ==========================================================================
// KHỐI 1: KHỞI TẠO VÀ CHÈN GIAO DIỆN VÀO DOM (AN TOÀN)
// ==========================================================================
function khoiTaoGiaoDienYkienGiamSat(tabYkienCung, khuVucTab) {
    let nutMenu = document.getElementById("tabYkienGiamSat");
    
    // 1. NỘI SUY NÚT MENU BÊN TRÁI (Nếu chưa có)
    if (!nutMenu) {
        nutMenu = document.createElement("button");
        nutMenu.className = "the-chuyen nav-link";
        nutMenu.id = "tabYkienGiamSat";
        nutMenu.setAttribute("data-bs-toggle", "tab");
        nutMenu.setAttribute("data-bs-target", "#khuYkienGiamSat");
        nutMenu.setAttribute("type", "button");
        nutMenu.setAttribute("role", "tab");
        
        nutMenu.innerHTML = `
            <span class="b-tuong">
                <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-bottom;">
                    <path d="M12 5C5.63636 5 2 12 2 12C2 12 5.63636 19 12 19C18.3636 19 22 12 22 12C22 12 18.3636 5 12 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span> Tổng hợp ý kiến GS
        `;
        
        tabYkienCung.parentNode.insertBefore(nutMenu, tabYkienCung.nextSibling);
    }
    
    // Đảm bảo không bị gán sự kiện click nhiều lần
    nutMenu.removeEventListener("click", taiDlYkienGiamSat);
    nutMenu.addEventListener("click", taiDlYkienGiamSat);

    // 2. KHUNG HIỂN THỊ BẢNG (TAB PANE)
    let pane = document.getElementById("khuYkienGiamSat");
    
    if (!pane) {
        pane = document.createElement("div");
        pane.className = "tab-pane fade px-4 py-3";
        pane.id = "khuYkienGiamSat";
        
        let khuYkien = document.getElementById("khuYkien");
        if (khuYkien) {
            khuYkien.parentNode.insertBefore(pane, khuYkien.nextSibling);
        } else {
            khuVucTab.appendChild(pane);
        }
    }
    
    // Bơm cấu trúc bảng nếu thẻ pane đang trống
    if (pane.innerHTML.trim() === "") {
        pane.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="text-danger fw-bold text-uppercase m-0">Tổng hợp ý kiến của Lãnh đạo và ban giám sát</h4>
                <button class="btn btn-primary btn-sm fw-bold btn-reactbits-shiny shadow-sm" onclick="taiDlYkienGiamSat()">
                    <i class="bi bi-arrow-repeat me-1"></i> Làm mới dữ liệu
                </button>
            </div>
            <div class="table-responsive bg-white rounded shadow-sm border p-2" style="max-height: calc(100vh - 120px); overflow-y: auto;">
                <table class="table table-hover table-bordered mb-0" id="bangYkienGiamSat">
                    <thead class="table-light" style="position: sticky; top: 0; z-index: 1;">
                        <tr>
                            <th class="text-center align-middle" style="width: 5%; background-color: #0d6efd; color: white; border: none;">STT</th>
                            <th class="align-middle" style="width: 25%; background-color: #0d6efd; color: white; border: none;">Họ và tên</th>
                            <th class="align-middle" style="width: 70%; background-color: #0d6efd; color: white; border: none;">Nội dung ý kiến đánh giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="3" class="text-center text-muted py-4 fst-italic">Vui lòng đợi, đang tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }
}

// ==========================================================================
// KHỐI 2: XỬ LÝ API TRÍCH XUẤT DỮ LIỆU TỪ MÁY CHỦ
// ==========================================================================
function taiDlYkienGiamSat() {
    // Kích hoạt lại bước vẽ khung nếu người dùng tải qua lệnh khác
    let pane = document.getElementById("khuYkienGiamSat");
    if (pane && pane.innerHTML.trim() === "") {
        khoiTaoGiaoDienYkienGiamSat(document.getElementById("tabYkien"), document.querySelector("#ungDungChinh .tab-content"));
    }

    if (typeof datTaiDl === 'function') datTaiDl(true, "Đang tổng hợp ý kiến giám sát...");
    
    if (typeof khachApi !== 'undefined' && typeof khachApi.goiThuCong === 'function') {
        khachApi.goiThuCong({ hdong: "laydlykiengiamsat" }, function(kq) {
            if (typeof datTaiDl === 'function') datTaiDl(false);
            
            if (kq && kq.ttai === 'tcong') {
                veBangYkienGiamSat(kq.dliu);
            } else {
                let err = kq ? kq.tbao : "Lỗi xác thực máy chủ";
                if (typeof hienThongb === 'function') hienThongb('loi', "Truy xuất thất bại: " + err);
            }
        }, function(loi) {
            if (typeof datTaiDl === 'function') datTaiDl(false);
            if (typeof hienThongb === 'function') hienThongb('loi', "Lỗi kết nối Server: " + loi.message);
        });
    } else {
        if (typeof datTaiDl === 'function') datTaiDl(false);
        console.error("API chưa sẵn sàng.");
    }
}

// ==========================================================================
// KHỐI 3: VẼ BẢNG DỮ LIỆU LÊN GIAO DIỆN
// ==========================================================================
function veBangYkienGiamSat(duLieu) {
    let tbody = document.querySelector("#bangYkienGiamSat tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    if (!duLieu || duLieu.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4 fst-italic">Hệ thống ghi nhận không có ý kiến giám sát nào trong chu kỳ này.</td></tr>';
        return;
    }

    let html = "";
    let stt = 1;
    
    duLieu.forEach(item => {
        let rawYkien = String(item.ykien || "").trim();
        let arrYkien = rawYkien.split(/\r?\n/);
        
        let formattedYkien = '<ul style="margin: 0; padding-left: 1.2rem; list-style-type: square; color: #212529; line-height: 1.6;">';
        
        arrYkien.forEach(dong => {
            let strDong = dong.trim();
            if (strDong !== "") {
                strDong = strDong.replace(/^[-*•+]\s*/, '');
                formattedYkien += `<li style="margin-bottom: 6px; word-wrap: break-word; white-space: normal;">${strDong}</li>`;
            }
        });
        formattedYkien += '</ul>';

        html += `
            <tr>
                <td class="text-center align-middle fw-bold">${stt++}</td>
                <td class="ps-3 align-middle">
                    <div class="fw-bold text-primary text-uppercase" style="font-size: 14px;">${item.tenn}</div>
                    <div class="text-secondary mt-1" style="font-size: 11.5px; font-style: italic; font-weight: normal;">
                        <i class="bi bi-person-vcard me-1"></i>ID: ${item.maId}
                    </div>
                </td>
                <td class="align-middle p-3">
                    <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 12px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        ${formattedYkien}
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}
