// =========================================================================
// KHỐI QUẢN LÝ MA TRẬN PHÂN QUYỀN HỆ THỐNG (BẢN CHUẨN ĐỒNG BỘ CÔNG KHAI 1 CLICK)
// Quản lý Menu Hệ thống, Nút TKB, Khóa Sổ Đầu Bài Tuần & Chế độ Công khai 1 Click
// =========================================================================

let duLieuBangPhanQuyen = [];

const DANH_SACH_MENU_HE_THONG = [
    { id: 'menuCaiDat', ten: '1. Cài đặt' },
    { id: 'menuDanhMucGV', ten: '2. DM Giáo viên' },
    { id: 'menuDanhMucLop', ten: '3. DM Lớp' },
    { id: 'menuKhungChuongTrinh', ten: '4. Khung CT' },
    { id: 'menuPhanCong', ten: '5. Phân công' },
    { id: 'menuDanhMucSGK', ten: '6. DM SGK' },
    { id: 'menuPhanPhoiChuongTrinh', ten: '7. PP Chương trình' },
    { id: 'menuPhanQuyen', ten: '8. Phân quyền' }
];

const DANH_SACH_NUT_CHUC_NANG = [
    { id: 'btnNhapExcelTKB', ten: 'Nhập Excel' },
    { id: 'btnKhoiPhuc', ten: 'Tuần mới' },
    { id: 'btnLuuTuan', ten: 'Lưu TKB Tuần' },
    { id: 'btnLuuCoDinh', ten: 'TKB Cố Định' },
    { id: 'btnXepTuDong', ten: 'Xếp Tự Động' },
    { id: 'btnKiemTra', ten: 'Định Mức tiết' },
    { id: 'btnChuyenTuan', ten: 'Mũi tên Chuyển tuần' },
    { id: 'btnLuuSua', ten: 'Lưu Sửa' },
    { id: 'btnKhoaSoDauBai', ten: 'Khóa Sổ đầu bài Tuần' }
];

// =========================================================================
// HÀM TIỆN ÍCH LẤY QUYỀN CÔNG KHAI
// =========================================================================
function layQuyenCongKhaiHienTai() {
    if (typeof window.layQuyenCongKhaiHienTai === 'function') {
        return window.layQuyenCongKhaiHienTai();
    }
    if (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.QUYEN_CONG_KHAI) {
        return thongSoHocVu.QUYEN_CONG_KHAI;
    }
    if (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.MA_TRAN_PHAN_QUYEN) {
        let mt = thongSoHocVu.MA_TRAN_PHAN_QUYEN;
        for (let k in mt) {
            let kLC = k.trim().toLowerCase();
            if (kLC === '*' || kLC.includes('công khai') || kLC.includes('congkhai')) {
                return mt[k];
            }
        }
    }
    return { menu: [], nut: [], lop: [] };
}

// =========================================================================
// HÀM HIỂN THỊ THÔNG BÁO TOAST TỨC THÌ (CHO SỰ KIỆN 1 CLICK)
// =========================================================================
function hienThiToastPhanQuyen(noiDung, loai = 'thanh_cong') {
    let oldToast = document.getElementById('toastPhanQuyen');
    if (oldToast) oldToast.remove();

    let div = document.createElement('div');
    div.id = 'toastPhanQuyen';
    let bgClass = (loai === 'thanh_cong') ? 'bg-emerald-800 border-emerald-500' : 'bg-slate-800 border-slate-600';
    div.className = `fixed bottom-6 left-1/2 -translate-x-1/2 ${bgClass} border text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 z-[99999] transition-all duration-300 transform scale-95 opacity-0 text-sm font-bold`;
    div.innerHTML = noiDung;
    document.body.appendChild(div);

    requestAnimationFrame(() => {
        div.classList.remove('scale-95', 'opacity-0');
        div.classList.add('scale-100', 'opacity-100');
    });

    setTimeout(() => {
        div.classList.remove('scale-100', 'opacity-100');
        div.classList.add('scale-95', 'opacity-0');
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

// =========================================================================
// SỰ KIỆN 1 CLICK: BẬT / TẮT HIỂN THỊ CÔNG KHAI VÀ TỰ ĐỘNG LƯU MÁY CHỦ
// =========================================================================
async function xuLyChuyenDoiCongKhai1Click(loai, idItem, trangThaiMoi, tenHienThi = '') {
    let coQuyenQuanTri = (typeof quyenSuaChua !== 'undefined' && quyenSuaChua);
    if (!coQuyenQuanTri) {
        alert("Từ chối: Chỉ tài khoản Quản trị (Admin) mới có quyền bật/tắt hiển thị công khai!");
        return false;
    }

    let emailAdmin = (typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' && window.dinhDanhGiaoVienToanCuc !== '') 
        ? window.dinhDanhGiaoVienToanCuc 
        : (typeof window.emailGiaoVienToanCuc !== 'undefined' ? window.emailGiaoVienToanCuc : '');

    // 1. Cập nhật ngay lập tức bộ nhớ Client (Optimistic UI) để giao diện phản hồi tức thì
    if (typeof thongSoHocVu !== 'undefined') {
        if (!thongSoHocVu.QUYEN_CONG_KHAI) thongSoHocVu.QUYEN_CONG_KHAI = { menu: [], nut: [], lop: [] };
        let arr = thongSoHocVu.QUYEN_CONG_KHAI[loai] || [];
        let idx = arr.indexOf(idItem);
        if (trangThaiMoi && idx === -1) arr.push(idItem);
        if (!trangThaiMoi && idx !== -1) arr.splice(idx, 1);
        thongSoHocVu.QUYEN_CONG_KHAI[loai] = arr;

        if (!thongSoHocVu.MA_TRAN_PHAN_QUYEN) thongSoHocVu.MA_TRAN_PHAN_QUYEN = {};
        thongSoHocVu.MA_TRAN_PHAN_QUYEN['* (Công khai)'] = thongSoHocVu.QUYEN_CONG_KHAI;
        
        try {
            localStorage.setItem(layKhoaCachLy('SmartTKB_CauHinh'), JSON.stringify(thongSoHocVu));
        } catch(e) {}
    }

    // 2. Đồng bộ giao diện ngay
    capNhatHienThiPhanQuyen();
    if (typeof kiemSoatGiaoDien === 'function') kiemSoatGiaoDien();

    // 3. Hiển thị Toast thông báo trạng thái
    let tenItem = tenHienThi || idItem;
    let thongBaoToast = trangThaiMoi 
        ? `✅ Đã BẬT hiển thị công khai cho [${tenItem}] (Ai cũng xem được)` 
        : `🔒 Đã TẮT hiển thị công khai cho [${tenItem}] (Chỉ hiện khi cấp quyền trong ma trận)`;
    hienThiToastPhanQuyen(thongBaoToast, trangThaiMoi ? 'thanh_cong' : 'dong');

    // 4. Nếu đang mở Tab 8 -> Vẽ lại bảng ma trận để cập nhật checkbox
    let khungPQ = document.getElementById('khungPhanQuyen');
    if (khungPQ && !khungPQ.classList.contains('hidden')) {
        let dongCK = duLieuBangPhanQuyen.find(d => {
            let tk = String(d[0]).trim().toLowerCase();
            return tk === '*' || tk.includes('công khai') || tk.includes('congkhai');
        });
        if (dongCK) {
            let colIdx = (loai === 'lop') ? 1 : ((loai === 'nut') ? 2 : 3);
            let dsArr = dongCK[colIdx] ? String(dongCK[colIdx]).split(',').map(s=>s.trim()).filter(String) : [];
            let i = dsArr.indexOf(idItem);
            if (trangThaiMoi && i === -1) dsArr.push(idItem);
            if (!trangThaiMoi && i !== -1) dsArr.splice(i, 1);
            dongCK[colIdx] = dsArr.join(', ');
        }
        hienThiBangPhanQuyen();
    }

    // 5. Gửi yêu cầu lưu tự động lên máy chủ (Chạy ngầm trong nền)
    try {
        const phanHoi = await fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify({
                thaoTac: 'chuyenDoiCongKhai',
                loai: loai,
                id: idItem,
                congKhai: trangThaiMoi,
                emailTruyCap: emailAdmin
            })
        });
        const kq = await phanHoi.json();
        if (kq.trangThai === 'Thành công' && kq.quyenCongKhai) {
            thongSoHocVu.QUYEN_CONG_KHAI = kq.quyenCongKhai;
            thongSoHocVu.MA_TRAN_PHAN_QUYEN['* (Công khai)'] = kq.quyenCongKhai;
            try {
                localStorage.setItem(layKhoaCachLy('SmartTKB_CauHinh'), JSON.stringify(thongSoHocVu));
            } catch(e) {}
            capNhatHienThiPhanQuyen();
            if (typeof kiemSoatGiaoDien === 'function') kiemSoatGiaoDien();
        } else if (kq.trangThai !== 'Thành công') {
            alert("Lỗi máy chủ: " + (kq.thongBao || "Không thể lưu trạng thái công khai"));
        }
    } catch (loi) {
        console.warn("Lỗi lưu công khai lên máy chủ:", loi);
    }

    return true;
}

// Bắt sự kiện 1 click từ menu sidebar
function xuLyChuyenDoiCongKhaiTuMenu(event, loai, idItem, tenHienThi) {
    if (event) {
        event.preventDefault();
        event.stopPropagation(); // Ngăn kích hoạt chuyển tab khi bấm nút toggle
    }
    let quyenCK = layQuyenCongKhaiHienTai();
    let daBat = quyenCK[loai] && quyenCK[loai].includes(idItem);
    let trangThaiMoi = !daBat;
    xuLyChuyenDoiCongKhai1Click(loai, idItem, trangThaiMoi, tenHienThi);
}

// Bắt sự kiện 1 click từ checkbox trong bảng ma trận Tab 8
function xuLyChuyenDoiCongKhaiTuCheckbox(cb, loai, idItem, tenHienThi) {
    let trangThaiMoi = cb.checked;
    xuLyChuyenDoiCongKhai1Click(loai, idItem, trangThaiMoi, tenHienThi);
}

// =========================================================================
// HÀM GẮN NÚT CHUYỂN ĐỔI CÔNG KHAI 1 CLICK BÊN CẠNH CÁC MENU CHO ADMIN
// =========================================================================
function ganNutChuyenDoiCongKhaiNhanhChoAdmin() {
    let coQuyenQuanTri = (typeof quyenSuaChua !== 'undefined' && quyenSuaChua);
    let quyenCK = layQuyenCongKhaiHienTai();

    DANH_SACH_MENU_HE_THONG.forEach(itemMenu => {
        let menuEl = document.getElementById(itemMenu.id);
        if (!menuEl) return;

        let nutCu = menuEl.querySelector('.btn-badge-cong-khai');
        if (!coQuyenQuanTri) {
            if (nutCu) nutCu.remove();
            return;
        }

        let daCongKhai = quyenCK.menu && quyenCK.menu.includes(itemMenu.id);
        let badgeHtml = daCongKhai 
            ? `<button type="button" onclick="xuLyChuyenDoiCongKhaiTuMenu(event, 'menu', '${itemMenu.id}', '${itemMenu.ten}')" class="btn-badge-cong-khai ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-400/40 flex items-center gap-1 flex-none z-10 transition-all shadow-sm" title="Đang hiển thị công khai (Ai cũng xem được). Bấm 1 click để TẮT công khai"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Công khai</span></button>`
            : `<button type="button" onclick="xuLyChuyenDoiCongKhaiTuMenu(event, 'menu', '${itemMenu.id}', '${itemMenu.ten}')" class="btn-badge-cong-khai ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 hover:bg-slate-700 border border-slate-500/40 flex items-center gap-1 flex-none z-10 transition-all shadow-sm" title="Đang đóng (Chỉ hiện khi cấp quyền trong ma trận). Bấm 1 click để BẬT công khai"><svg class="w-2.5 h-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg><span>Nội bộ</span></button>`;

        if (nutCu) {
            nutCu.outerHTML = badgeHtml;
        } else {
            menuEl.insertAdjacentHTML('beforeend', badgeHtml);
        }
    });
}

// =========================================================================
// HÀM KIỂM SOÁT HIỂN THỊ MENU VÀ NÚT CHỨC NĂNG
// =========================================================================
function capNhatHienThiPhanQuyen() {
    let coQuyenQuanTri = (typeof quyenSuaChua !== 'undefined' && quyenSuaChua);
    let quyenCongKhai = layQuyenCongKhaiHienTai();

    // 1. Kiểm soát hiển thị Menu 8: Phân quyền Hệ thống
    let menuPQ = document.getElementById('menuPhanQuyen');
    let duocXemMenu = false;
    if (menuPQ) {
        duocXemMenu = coQuyenQuanTri || 
                          (typeof quyenChiTiet !== 'undefined' && quyenChiTiet.menu && quyenChiTiet.menu.includes('menuPhanQuyen')) ||
                          (quyenCongKhai.menu && quyenCongKhai.menu.includes('menuPhanQuyen'));
        menuPQ.style.display = duocXemMenu ? 'flex' : 'none';
    }

    // 2. Kiểm soát hiển thị Menu 7: Phân phối Chương trình
    let menuPPCT = document.getElementById('menuPhanPhoiChuongTrinh');
    let duocXemPPCT = false;
    if (menuPPCT) {
        duocXemPPCT = coQuyenQuanTri || 
                          (typeof quyenChiTiet !== 'undefined' && quyenChiTiet.menu && quyenChiTiet.menu.includes('menuPhanPhoiChuongTrinh')) ||
                          (quyenCongKhai.menu && quyenCongKhai.menu.includes('menuPhanPhoiChuongTrinh'));
        menuPPCT.style.display = duocXemPPCT ? 'flex' : 'none';
    }

    let nhanHT = document.getElementById('nhanHeThong');
    if (nhanHT && (duocXemMenu || duocXemPPCT)) {
        nhanHT.style.display = 'flex';
    }

    // 3. Kiểm soát hiển thị Nút Khóa Sổ Đầu Bài Tuần
    let btnKhoaSo = document.getElementById('btnKhoaSoDauBai');
    if (btnKhoaSo) {
        let duocBamKhoaSo = coQuyenQuanTri || 
                            (typeof quyenChiTiet !== 'undefined' && quyenChiTiet.nut && quyenChiTiet.nut.includes('btnKhoaSoDauBai')) ||
                            (quyenCongKhai.nut && quyenCongKhai.nut.includes('btnKhoaSoDauBai'));
        btnKhoaSo.style.display = duocBamKhoaSo ? 'inline-flex' : 'none';
    }

    // 4. Nếu là Admin: gắn nút chuyển đổi công khai nhanh bên cạnh các menu
    ganNutChuyenDoiCongKhaiNhanhChoAdmin();
}

// =========================================================================
// CƠ CHẾ BẢO ĐẢM KHỞI TẠO DOM
// =========================================================================
function khoiTaoDOMPhanQuyen() {
    const nav = document.querySelector('nav');
    const vungChinh = document.getElementById('vungHienThiChinh');

    // 1. Chèn Menu 8 vào thanh Sidebar nếu trong index.html chưa có
    if (nav && !document.getElementById('menuPhanQuyen')) {
        const menuHtml = `
            <a id="menuPhanQuyen" onclick="moTabPhanQuyenChuyenDung()" style="display: none;" class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-white/10 transition-all duration-150 cursor-pointer group">
                <svg class="w-5 h-5 flex-none opacity-70 group-hover:opacity-100 transition-opacity text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M8 11l3 3 5-5"></path></svg>
                <span class="font-bold text-white/80 group-hover:text-white transition-colors text-[14px] whitespace-nowrap">8. Phân quyền Hệ thống</span>
            </a>`;
        nav.insertAdjacentHTML('beforeend', menuHtml);
    }

    // 2. Chèn Khung ma trận nếu trong index.html chưa có
    if (vungChinh && !document.getElementById('khungPhanQuyen')) {
        const khungHtml = `
            <div id="khungPhanQuyen" class="hidden p-4 w-full h-full flex-col font-sans">
                <div class="flex justify-between items-center mb-4 flex-none">
                    <h2 class="text-xl font-extrabold text-blue-900 uppercase">MA TRẬN PHÂN QUYỀN HỆ THỐNG</h2>
                    <div class="flex items-center gap-2">
                        <button onclick="taiDuLieuPhanQuyenTuMayChu()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 text-sm shadow transition duration-200 rounded flex items-center gap-1.5">
                            Tải lại
                        </button>
                        <button onclick="themDongPhanQuyenMoi()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-sm shadow transition duration-200 rounded flex items-center gap-1.5">
                            + Cấp quyền mới
                        </button>
                        <button onclick="luuDuLieuPhanQuyenSangMayChu()" class="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 text-sm shadow transition duration-200 rounded flex items-center gap-1.5">
                            Lưu Hệ Thống
                        </button>
                    </div>
                </div>
                <div class="overflow-auto border border-gray-400 shadow-sm bg-white relative flex-1">
                    <table class="bang-excel w-full min-w-[1000px]">
                        <thead class="sticky top-0 z-20 bg-slate-200 text-slate-900 shadow-sm text-center">
                            <tr>
                                <th class="py-2 w-64">Tài khoản (Định danh)</th>
                                <th class="py-2">Quyền xếp thời khoá biểu Lớp học</th>
                                <th class="py-2">Phân quyền Menu</th>
                                <th class="py-2">Phân quyền Nút chức năng</th>
                                <th class="py-2 w-20 text-red-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody id="vungDuLieuPhanQuyen">
                            <tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">Vui lòng chờ, đang tải dữ liệu...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>`;
        vungChinh.insertAdjacentHTML('beforeend', khungHtml);
    }

    // 3. Kích hoạt cập nhật hiển thị ngay
    capNhatHienThiPhanQuyen();
}

// Hook vào hàm kiemSoatGiaoDien của app.js
function ganKetHeThongKiemSoat() {
    if (typeof window.kiemSoatGiaoDien === 'function' && !window.kiemSoatGiaoDien._daHookPhanQuyen) {
        const kiemSoatGoc = window.kiemSoatGiaoDien;
        window.kiemSoatGiaoDien = function() {
            kiemSoatGoc();
            capNhatHienThiPhanQuyen();
        };
        window.kiemSoatGiaoDien._daHookPhanQuyen = true;
    }
}

// Khởi tạo đa tầng để chống trễ nhịp sự kiện DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        khoiTaoDOMPhanQuyen();
        ganKetHeThongKiemSoat();
        setTimeout(capNhatHienThiPhanQuyen, 300);
        setTimeout(capNhatHienThiPhanQuyen, 1000);
    });
} else {
    khoiTaoDOMPhanQuyen();
    ganKetHeThongKiemSoat();
    setTimeout(capNhatHienThiPhanQuyen, 300);
    setTimeout(capNhatHienThiPhanQuyen, 1000);
}

// =========================================================================
// CÁC HÀM XỬ LÝ NGHIỆP VỤ BẢNG MA TRẬN PHÂN QUYỀN
// =========================================================================

function moTabPhanQuyenChuyenDung() {
    if (typeof kichHoatTab === 'function') {
        kichHoatTab('menuPhanQuyen', 'khungPhanQuyen', false);
        taiDuLieuPhanQuyenTuMayChu();
    }
}

async function taiDuLieuPhanQuyenTuMayChu() {
    const vungDuLieu = document.getElementById('vungDuLieuPhanQuyen');
    if (!vungDuLieu) return;
    vungDuLieu.innerHTML = '<tr><td colspan="5" class="text-center py-10 font-bold text-blue-600">Đang nạp ma trận phân quyền...</td></tr>';
    
    try {
        const phanHoi = await fetchVoiCoCheThuLai(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layPhanQuyenHethong`);
        let ketQua = await phanHoi.json();
        
        if (ketQua && ketQua.trangThai === 'loi_he_thong') {
            throw new Error(ketQua.thongBao);
        }
        
        if (Array.isArray(ketQua)) {
            duLieuBangPhanQuyen = ketQua;
        } else if (ketQua && ketQua.trangThai === 'thanh_cong') {
            throw new Error("Mã máy chủ chưa được đồng bộ. Đồng chí vui lòng chọn Manage Deployments -> New version trên Google Apps Script.");
        } else {
            duLieuBangPhanQuyen = [];
        }
        
        hienThiBangPhanQuyen();
    } catch (loi) {
        vungDuLieu.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 font-bold py-10">Lỗi kết nối: ${loi.message}</td></tr>`;
    }
}

function taoNhomCheckbox(danhSachGoc, danhSachDaChon, kieuPhanLoai, laDongCongKhai = false) {
    let html = `<div class="flex flex-wrap gap-2 justify-start max-h-36 overflow-y-auto p-1 custom-scrollbar">`;
    danhSachGoc.forEach(item => {
        let idItem = typeof item === 'object' ? item.id : item;
        let tenItem = typeof item === 'object' ? item.ten : item;
        let daChon = danhSachDaChon.includes(idItem) ? 'checked' : '';
        
        // Sự kiện 1 click tự động cập nhật và lưu ngay lập tức cho dòng công khai
        let suKienClick = laDongCongKhai 
            ? `onchange="xuLyChuyenDoiCongKhaiTuCheckbox(this, '${kieuPhanLoai}', '${idItem}', '${tenItem}')"`
            : '';
        let borderClass = laDongCongKhai && daChon ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-extrabold shadow-sm' : 'bg-slate-50 border-gray-300 text-slate-700';

        html += `<label class="flex items-center gap-1 border px-2 py-1 rounded text-xs cursor-pointer hover:bg-slate-100 transition-colors ${borderClass}">
            <input type="checkbox" value="${idItem}" data-loai="${kieuPhanLoai}" ${daChon} ${suKienClick} class="cursor-pointer">
            <span class="font-semibold whitespace-nowrap">${tenItem}</span>
        </label>`;
    });
    html += `</div>`;
    return html;
}

function hienThiBangPhanQuyen() {
    const vungDuLieu = document.getElementById('vungDuLieuPhanQuyen');
    if (!vungDuLieu) return;
    let html = '';
    let dsLop = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.DANH_SACH_LOP) ? thongSoHocVu.DANH_SACH_LOP : [];

    // Tách dòng Công khai ra khỏi danh sách tài khoản cá nhân
    let dongCongKhai = null;
    let danhSachCaNhan = [];

    duLieuBangPhanQuyen.forEach(dong => {
        let taiKhoan = dong[0] ? String(dong[0]).trim() : '';
        let tkLC = taiKhoan.toLowerCase();
        if (tkLC === '*' || tkLC.includes('công khai') || tkLC.includes('congkhai')) {
            dongCongKhai = dong;
        } else {
            danhSachCaNhan.push(dong);
        }
    });

    // Nếu chưa có dòng công khai, lấy từ thongSoHocVu hoặc khởi tạo mặc định
    let quyenCK = layQuyenCongKhaiHienTai();
    let lopCK = dongCongKhai ? (dongCongKhai[1] ? String(dongCongKhai[1]).split(',').map(s=>s.trim()).filter(String) : []) : (quyenCK.lop || []);
    let nutCK = dongCongKhai ? (dongCongKhai[2] ? String(dongCongKhai[2]).split(',').map(s=>s.trim()).filter(String) : []) : (quyenCK.nut || []);
    let menuCK = dongCongKhai ? (dongCongKhai[3] ? String(dongCongKhai[3]).split(',').map(s=>s.trim()).filter(String) : []) : (quyenCK.menu || []);

    // 1. GHIM DÒNG CÔNG KHAI ĐẦU BẢNG (1 CLICK LÀ TỰ LƯU NGAY)
    html += `<tr class="dong-phan-quyen bg-emerald-50/80 border-b-2 border-emerald-400 hover:bg-emerald-100/50 transition-colors shadow-sm" data-la-cong-khai="true">
        <td class="p-2.5 align-top">
            <input type="hidden" class="input-tai-khoan" value="* (Công khai)">
            <div class="flex items-center gap-2 p-1.5 bg-emerald-100/80 border border-emerald-300 rounded shadow-sm">
                <span class="text-2xl flex-none">🌐</span>
                <div>
                    <div class="font-black text-emerald-950 text-xs uppercase tracking-wide">CÔNG KHAI (TOÀN TRƯỜNG)</div>
                    <div class="text-[10px] text-emerald-700 italic font-semibold">Tất cả mọi người / 1 click là có hiệu lực</div>
                </div>
            </div>
        </td>
        <td class="p-2 align-top border-l border-emerald-200">${taoNhomCheckbox(dsLop, lopCK, 'lop', true)}</td>
        <td class="p-2 align-top border-l border-emerald-200">${taoNhomCheckbox(DANH_SACH_MENU_HE_THONG, menuCK, 'menu', true)}</td>
        <td class="p-2 align-top border-l border-emerald-200">${taoNhomCheckbox(DANH_SACH_NUT_CHUC_NANG, nutCK, 'nut', true)}</td>
        <td class="p-2 text-center align-middle border-l border-emerald-200">
            <span class="text-[11px] font-extrabold text-emerald-800 bg-emerald-200/80 border border-emerald-400 px-2 py-1 rounded shadow-sm whitespace-nowrap">Mặc định</span>
        </td>
    </tr>`;

    // 2. CÁC DÒNG PHÂN QUYỀN TÀI KHOẢN CÁ NHÂN
    if (danhSachCaNhan.length === 0) {
        html += `<tr><td colspan="5" class="text-center py-8 font-bold text-slate-500 italic bg-white">Chưa có phân quyền tài khoản cá nhân nào. Bấm "+ Cấp quyền mới" để thêm.</td></tr>`;
    } else {
        danhSachCaNhan.forEach((dong, index) => {
            let taiKhoan = dong[0] ? String(dong[0]).trim() : '';
            let lopChon = dong[1] ? String(dong[1]).split(',').map(s => s.trim()).filter(String) : [];
            let nutChon = dong[2] ? String(dong[2]).split(',').map(s => s.trim()).filter(String) : [];
            let menuChon = dong[3] ? String(dong[3]).split(',').map(s => s.trim()).filter(String) : [];

            html += `<tr class="dong-phan-quyen bg-white hover:bg-slate-50 transition-colors border-b border-gray-200" data-index="${index}">
                <td class="p-2 align-top">
                    <input type="text" value="${taiKhoan}" placeholder="Nhập email hoặc định danh..." class="input-tai-khoan w-full border border-blue-400 rounded px-2 py-1.5 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500">
                </td>
                <td class="p-2 align-top border-l border-gray-300 bg-gray-50/50">${taoNhomCheckbox(dsLop, lopChon, 'lop', false)}</td>
                <td class="p-2 align-top border-l border-gray-300">${taoNhomCheckbox(DANH_SACH_MENU_HE_THONG, menuChon, 'menu', false)}</td>
                <td class="p-2 align-top border-l border-gray-300 bg-gray-50/50">${taoNhomCheckbox(DANH_SACH_NUT_CHUC_NANG, nutChon, 'nut', false)}</td>
                <td class="p-2 text-center align-middle border-l border-gray-300">
                    <button onclick="xoaDongPhanQuyen(this)" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors" title="Xóa quyền">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            </tr>`;
        });
    }

    vungDuLieu.innerHTML = html;
}

function themDongPhanQuyenMoi() {
    duLieuBangPhanQuyen.push(['', '', '', '']);
    hienThiBangPhanQuyen();
    setTimeout(() => {
        let khung = document.querySelector('#khungPhanQuyen .overflow-auto');
        if (khung) khung.scrollTop = khung.scrollHeight;
    }, 50);
}

function xoaDongPhanQuyen(btn) {
    let tr = btn.closest('tr');
    if (tr.getAttribute('data-la-cong-khai') === 'true') {
        alert("Không thể xóa dòng cấu hình Công khai mặc định của hệ thống!");
        return;
    }
    if (!confirm("Đồng chí chắc chắn muốn thu hồi phân quyền của định danh này?")) return;
    
    let taiKhoan = tr.querySelector('.input-tai-khoan').value.trim();
    let idx = duLieuBangPhanQuyen.findIndex(d => String(d[0]).trim() === taiKhoan);
    if (idx !== -1) {
        duLieuBangPhanQuyen.splice(idx, 1);
        hienThiBangPhanQuyen();
    }
}

async function luuDuLieuPhanQuyenSangMayChu() {
    let mangGhi = [];
    let cacDong = document.querySelectorAll('.dong-phan-quyen');
    
    cacDong.forEach(tr => {
        let inputTK = tr.querySelector('.input-tai-khoan');
        let taiKhoan = inputTK ? inputTK.value.trim() : '';
        if (taiKhoan !== '') {
            let chkLop = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="lop"]:checked')).map(cb => cb.value);
            let chkMenu = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="menu"]:checked')).map(cb => cb.value);
            let chkNut = Array.from(tr.querySelectorAll('input[type="checkbox"][data-loai="nut"]:checked')).map(cb => cb.value);
            
            mangGhi.push([taiKhoan, chkLop.join(', '), chkNut.join(', '), chkMenu.join(', ')]);
        }
    });

    let btnLuu = document.querySelector('button[onclick="luuDuLieuPhanQuyenSangMayChu()"]');
    let textGoc = btnLuu ? btnLuu.innerHTML : '';
    if (btnLuu) { btnLuu.innerHTML = "Đang xử lý..."; btnLuu.disabled = true; }

    try {
        const phanHoi = await fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify({ thaoTac: 'luuPhanQuyenHethong', duLieu: mangGhi })
        });
        const kq = await phanHoi.json();
        if (kq.trangThai === 'Thành công') {
            alert(kq.thongBao + " Cập nhật an toàn hoàn tất.");
            duLieuBangPhanQuyen = mangGhi; 

            // Cập nhật lại QUYEN_CONG_KHAI
            let quyenCK = layQuyenCongKhaiHienTai();
            mangGhi.forEach(dong => {
                let tk = String(dong[0]).trim().toLowerCase();
                if (tk === '*' || tk.includes('công khai') || tk.includes('congkhai')) {
                    quyenCK = {
                        lop: dong[1] ? String(dong[1]).split(',').map(s=>s.trim()).filter(String) : [],
                        nut: dong[2] ? String(dong[2]).split(',').map(s=>s.trim()).filter(String) : [],
                        menu: dong[3] ? String(dong[3]).split(',').map(s=>s.trim()).filter(String) : []
                    };
                }
            });
            if (typeof thongSoHocVu !== 'undefined') {
                thongSoHocVu.QUYEN_CONG_KHAI = quyenCK;
                try { localStorage.setItem(layKhoaCachLy('SmartTKB_CauHinh'), JSON.stringify(thongSoHocVu)); } catch(e) {}
            }

            hienThiBangPhanQuyen();
            capNhatHienThiPhanQuyen();
            if (typeof kiemSoatGiaoDien === 'function') kiemSoatGiaoDien();
        } else {
            alert("Lưu thất bại: " + kq.thongBao);
        }
    } catch (loi) {
        alert("Có sự cố kết nối máy chủ: " + loi.message);
    } finally {
        if (btnLuu) { btnLuu.innerHTML = textGoc; btnLuu.disabled = false; }
    }
}
