// =========================================================================
// KHỐI QUẢN LÝ MA TRẬN PHÂN QUYỀN HỆ THỐNG (BẢN HOÀN CHỈNH ĐỒNG BỘ)
// Tích hợp: Nút Khóa SĐB + Nút Khóa TKB Tuần + Bộ điều phối UI tự động
// =========================================================================

let duLieuBangPhanQuyen = [];
let duLieuKhoaTKBToanCuc = {}; // Lưu map { 1: { daKhoa: true, nguoiThucHien: '...' } }

const DANH_SACH_MENU_HE_THONG = [
    { id: 'menuCaiDat', ten: '1. Cài đặt' },
    { id: 'menuDanhMucGV', ten: '2. DM Giáo viên' },
    { id: 'menuDanhMucLop', ten: '3. DM Lớp' },
    { id: 'menuKhungChuongTrinh', ten: '4. Khung CT' },
    { id: 'menuPhanCong', ten: '5. Phân công' },
    { id: 'menuDanhMucSGK', ten: '6. DM SGK' },
    { id: 'menuPhanQuyen', ten: '7. Phân quyền' }
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
    { id: 'btnKhoaSoDauBai', ten: 'Khóa Sổ đầu bài Tuần' },
    { id: 'btnKhoaTKB', ten: 'Khóa TKB Tuần' } // <-- NÚT MỚI: KHÓA TKB TUẦN
];

// =========================================================================
// BỘ KIỂM SOÁT HIỂN THỊ QUYỀN TRÊN THANH CÔNG CỤ & MENU
// =========================================================================
function capNhatHienThiPhanQuyen() {
    let coQuyenQuanTri = (typeof quyenSuaChua !== 'undefined' && quyenSuaChua);

    // 1. Kiểm soát hiển thị Menu 7
    let menuPQ = document.getElementById('menuPhanQuyen');
    if (menuPQ) {
        let duocXemMenu = coQuyenQuanTri || 
                          (typeof quyenChiTiet !== 'undefined' && quyenChiTiet.menu && quyenChiTiet.menu.includes('menuPhanQuyen'));
        menuPQ.style.display = duocXemMenu ? 'flex' : 'none';
    }

    // 2. Kiểm soát hiển thị Nút Khóa Sổ Đầu Bài
    let btnKhoaSo = document.getElementById('btnKhoaSoDauBai');
    if (btnKhoaSo) {
        let duocBamKhoaSo = coQuyenQuanTri || 
                            (typeof quyenChiTiet !== 'undefined' && quyenChiTiet.nut && quyenChiTiet.nut.includes('btnKhoaSoDauBai'));
        btnKhoaSo.style.display = duocBamKhoaSo ? 'inline-flex' : 'none';
    }

    // 3. Kiểm soát hiển thị Nút Khóa TKB Tuần
    let btnKhoaTKB = document.getElementById('btnKhoaTKB');
    if (btnKhoaTKB) {
        let duocBamKhoaTKB = coQuyenQuanTri || 
                             (typeof quyenChiTiet !== 'undefined' && quyenChiTiet.nut && quyenChiTiet.nut.includes('btnKhoaTKB'));
        btnKhoaTKB.style.display = duocBamKhoaTKB ? 'inline-flex' : 'none';
    }

    // 4. Đồng bộ trạng thái khóa TKB lên giao diện
    dongBoTrangThaiKhoaTKBUI();
}

// =========================================================================
// THUẬT TOÁN ĐIỀU PHỐI KHÓA THỜI KHÓA BIỂU TUẦN (CLIENT ENGINE)
// =========================================================================

// Lấy tuần TKB hiện tại đang xem trên giao diện
function layTuanTKBDangXem() {
    let inputTuan = document.getElementById('hienThiTuanHienTai');
    return inputTuan ? parseInt(inputTuan.value, 10) || 1 : 1;
}

// Kiểm tra tuần TKB có bị khóa không
window.kiemTraTKBBiKhoa = function(tuan) {
    let t = parseInt(String(tuan).replace(/\D/g, ''), 10);
    return !!(duLieuKhoaTKBToanCuc[t] && duLieuKhoaTKBToanCuc[t].daKhoa);
};

// Đồng bộ giao diện TKB (Nút bấm, Sidebar, Khóa ô) theo trạng thái khóa
function dongBoTrangThaiKhoaTKBUI() {
    let tuanHienTai = layTuanTKBDangXem();
    let daKhoa = window.kiemTraTKBBiKhoa(tuanHienTai);
    let thongTin = duLieuKhoaTKBToanCuc[tuanHienTai] || {};

    // 1. Cập nhật nhãn trạng thái trên Sidebar Menu
    let theTrangThai = document.getElementById('trangThaiHeThong');
    if (theTrangThai) {
        if (daKhoa) {
            theTrangThai.className = "font-bold text-red-600 text-base leading-tight inline-block mt-0.5 animate-pulse";
            theTrangThai.innerHTML = `🔒 TKB Tuần ${tuanHienTai} Đã khóa`;
        } else {
            theTrangThai.className = "font-bold text-green-700 text-base leading-tight inline-block mt-0.5";
            theTrangThai.innerHTML = `Hệ thống mở`;
        }
    }

    // 2. Cập nhật màu sắc & Icon nút Khóa TKB
    let btnKhoa = document.getElementById('btnKhoaTKB');
    if (btnKhoa) {
        if (daKhoa) {
            btnKhoa.className = "bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 text-sm shadow transition duration-200 items-center gap-1.5 rounded-lg whitespace-nowrap";
            btnKhoa.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg><span>Mở Khóa TKB Tuần ${tuanHienTai}</span>`;
        } else {
            btnKhoa.className = "bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 text-sm shadow transition duration-200 items-center gap-1.5 rounded-lg whitespace-nowrap";
            btnKhoa.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg><span>Khóa TKB Tuần ${tuanHienTai}</span>`;
        }
    }

    // 3. Khóa mờ (disabled) toàn bộ các nút chỉnh sửa TKB khi tuần đã khóa
    const cacNutSuaTKB = ['btnLuuTuan', 'btnLuuSua', 'btnXepTuDong', 'btnKhoiPhuc', 'btnDongBoChuan'];
    cacNutSuaTKB.forEach(idNut => {
        let btn = document.getElementById(idNut);
        if (btn) {
            if (daKhoa) {
                btn.setAttribute('data-tam-khoa', 'true');
                btn.disabled = true;
                btn.classList.add('opacity-40', 'cursor-not-allowed');
                btn.title = `TKB Tuần ${tuanHienTai} đã bị khóa chuyên môn, không thể chỉnh sửa`;
            } else {
                if (btn.getAttribute('data-tam-khoa') === 'true') {
                    btn.removeAttribute('data-tam-khoa');
                    btn.disabled = false;
                    btn.classList.remove('opacity-40', 'cursor-not-allowed');
                    btn.title = '';
                }
            }
        }
    });

    // 4. Khóa cứng tương tác sửa trên bảng TKB (vùng hiển thị)
    let bangTKB = document.getElementById('vungHienThiDuLieu');
    if (bangTKB) {
        if (daKhoa) {
            bangTKB.style.pointerEvents = 'none'; // Không cho click sửa ô
            bangTKB.title = `TKB Tuần ${tuanHienTai} đã bị khóa (Chỉ xem)`;
        } else {
            bangTKB.style.pointerEvents = 'auto';
            bangTKB.title = '';
        }
    }
}

// Hàm thực thi khi bấm nút Khóa / Mở khóa TKB Tuần
async function thaoTacKhoaMoTKB() {
    let tuanHienTai = layTuanTKBDangXem();
    let daKhoa = window.kiemTraTKBBiKhoa(tuanHienTai);
    let hanhDongMoi = !daKhoa; // true = Khóa, false = Mở

    let thongBao = hanhDongMoi 
        ? `🔒 XÁC NHẬN KHÓA THỜI KHÓA BIỂU TOÀN TRƯỜNG:\n\nĐồng chí có chắc chắn muốn KHÓA Thời khóa biểu TUẦN ${tuanHienTai} của toàn trường?\n\n- Toàn bộ giáo viên chỉ có quyền XEM, không thể sửa đổi, xếp lại hay lưu TKB tuần này.\n- Dữ liệu tuần này được niêm phong chính thức.`
        : `🔓 XÁC NHẬN MỞ KHÓA THỜI KHÓA BIỂU:\n\nĐồng chí có chắc chắn muốn MỞ KHÓA TKB TUẦN ${tuanHienTai} cho toàn trường?\n\n- Ban Giám hiệu và người quản lý có thể tiếp tục điều chỉnh, xếp lịch và lưu TKB.`;

    if (!confirm(thongBao)) return;

    let btn = document.getElementById('btnKhoaTKB');
    let textGoc = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...`;
        btn.disabled = true;
    }

    try {
        let emailNguoiDung = (typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' && window.dinhDanhGiaoVienToanCuc !== '') 
            ? window.dinhDanhGiaoVienToanCuc 
            : (typeof window.emailGiaoVienToanCuc !== 'undefined' && window.emailGiaoVienToanCuc !== '' 
                ? window.emailGiaoVienToanCuc 
                : (typeof maGvDangNhapHeThong !== 'undefined' ? maGvDangNhapHeThong : ''));

        const phanHoi = await fetchVoiCoCheThuLai(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
            method: 'POST',
            body: JSON.stringify({
                thaoTac: 'khoaMoTKB',
                tuan: tuanHienTai,
                khoa: hanhDongMoi,
                emailTruyCap: emailNguoiDung
            })
        });

        const ketQua = await phanHoi.json();

        if (ketQua.trangThai === 'thanh_cong') {
            alert("✅ " + ketQua.thongBao);
            
            // Cập nhật RAM Client ngay
            duLieuKhoaTKBToanCuc[tuanHienTai] = {
                daKhoa: hanhDongMoi,
                tuan: tuanHienTai,
                nguoiThucHien: emailNguoiDung,
                thoiGian: 'Vừa xong'
            };

            // Cập nhật ngay giao diện TKB
            dongBoTrangThaiKhoaTKBUI();
        } else {
            alert("Thao tác thất bại: " + (ketQua.thongBao || "Lỗi không xác định."));
        }
    } catch (loi) {
        alert("Lỗi kết nối máy chủ: " + loi.message);
    } finally {
        if (btn) {
            btn.innerHTML = textGoc;
            btn.disabled = false;
        }
    }
}

// Tải trạng thái Khóa TKB từ máy chủ khi khởi động
async function taiTrangThaiKhoaTKBTuan() {
    try {
        const phanHoi = await fetchVoiCoCheThuLai(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layTrangThaiKhoaTKB`);
        let ketQua = await phanHoi.json();
        if (ketQua && typeof ketQua === 'object') {
            duLieuKhoaTKBToanCuc = ketQua;
            dongBoTrangThaiKhoaTKBUI();
        }
    } catch(e) {}
}

// =========================================================================
// KHỞI TẠO DOM & LẮNG NGHE SỰ KIỆN CHUYỂN TUẦN TKB
// =========================================================================
function khoiTaoDOMPhanQuyen() {
    const nav = document.querySelector('nav');
    const vungChinh = document.getElementById('vungHienThiChinh');

    // Chèn Menu 7 nếu trong index.html chưa có
    if (nav && !document.getElementById('menuPhanQuyen')) {
        const menuHtml = `
            <a id="menuPhanQuyen" onclick="moTabPhanQuyenChuyenDung()" style="display: none;" class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-white/10 transition-all duration-150 cursor-pointer group">
                <svg class="w-5 h-5 flex-none opacity-70 group-hover:opacity-100 transition-opacity text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M8 11l3 3 5-5"></path></svg>
                <span class="font-bold text-white/80 group-hover:text-white transition-colors text-[14px] whitespace-nowrap">7. Phân quyền Hệ thống</span>
            </a>`;
        nav.insertAdjacentHTML('beforeend', menuHtml);
    }

    // Chèn Khung ma trận nếu trong index.html chưa có
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
                                <th class="py-2 w-56">Tài khoản (Định danh)</th>
                                <th class="py-2">Quyền xếp thời khoá biểu Lớp học</th>
                                <th class="py-2">Phân quyền Menu</th>
                                <th class="py-2">Phân quyền Nút chức năng</th>
                                <th class="py-2 w-16 text-red-600">Xóa</th>
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

    // Lắng nghe sự kiện chuyển tuần TKB để đổi trạng thái khóa ngay lập tức
    let btnTuanTruoc = document.getElementById('btnTuanTruoc');
    let btnTuanTiep = document.getElementById('btnTuanTiep');
    let inputTuan = document.getElementById('hienThiTuanHienTai');

    if (btnTuanTruoc) btnTuanTruoc.addEventListener('click', () => setTimeout(dongBoTrangThaiKhoaTKBUI, 150));
    if (btnTuanTiep) btnTuanTiep.addEventListener('click', () => setTimeout(dongBoTrangThaiKhoaTKBUI, 150));
    if (inputTuan) {
        inputTuan.addEventListener('input', () => setTimeout(dongBoTrangThaiKhoaTKBUI, 150));
        inputTuan.addEventListener('change', () => setTimeout(dongBoTrangThaiKhoaTKBUI, 150));
    }

    capNhatHienThiPhanQuyen();
    taiTrangThaiKhoaTKBTuan();
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

// Khởi tạo đa tầng
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
// CÁC HÀM XỬ LÝ MA TRẬN PHÂN QUYỀN
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
        
        if (ketQua && ketQua.trangThai === 'loi_he_thong') throw new Error(ketQua.thongBao);
        
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

function taoNhomCheckbox(danhSachGoc, danhSachDaChon, kieuPhanLoai) {
    let html = `<div class="flex flex-wrap gap-2 justify-start max-h-32 overflow-y-auto p-1 custom-scrollbar">`;
    danhSachGoc.forEach(item => {
        let idItem = typeof item === 'object' ? item.id : item;
        let tenItem = typeof item === 'object' ? item.ten : item;
        let daChon = danhSachDaChon.includes(idItem) ? 'checked' : '';
        html += `<label class="flex items-center gap-1 bg-slate-50 border border-gray-300 px-2 py-1 rounded text-xs cursor-pointer hover:bg-slate-100 transition-colors">
            <input type="checkbox" value="${idItem}" data-loai="${kieuPhanLoai}" ${daChon} class="cursor-pointer">
            <span class="font-semibold text-slate-700 whitespace-nowrap">${tenItem}</span>
        </label>`;
    });
    html += `</div>`;
    return html;
}

function hienThiBangPhanQuyen() {
    const vungDuLieu = document.getElementById('vungDuLieuPhanQuyen');
    let html = '';
    let dsLop = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.DANH_SACH_LOP) ? thongSoHocVu.DANH_SACH_LOP : [];

    if (duLieuBangPhanQuyen.length === 0) {
        html = '<tr><td colspan="5" class="text-center py-10 font-bold text-slate-500">Chưa có dữ liệu cấp quyền nào. Bấm "Cấp quyền mới" để tạo.</td></tr>';
    } else {
        duLieuBangPhanQuyen.forEach((dong, index) => {
            let taiKhoan = dong[0] ? String(dong[0]).trim() : '';
            let lopChon = dong[1] ? String(dong[1]).split(',').map(s => s.trim()).filter(String) : [];
            let nutChon = dong[2] ? String(dong[2]).split(',').map(s => s.trim()).filter(String) : [];
            let menuChon = dong[3] ? String(dong[3]).split(',').map(s => s.trim()).filter(String) : [];

            html += `<tr class="dong-phan-quyen bg-white hover:bg-slate-50 transition-colors" data-index="${index}">
                <td class="p-2 align-top">
                    <input type="text" value="${taiKhoan}" placeholder="Nhập định danh truy cập..." class="input-tai-khoan w-full border border-blue-400 rounded px-2 py-1.5 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500">
                </td>
                <td class="p-2 align-top border-l border-gray-300 bg-gray-50/50">${taoNhomCheckbox(dsLop, lopChon, 'lop')}</td>
                <td class="p-2 align-top border-l border-gray-300">${taoNhomCheckbox(DANH_SACH_MENU_HE_THONG, menuChon, 'menu')}</td>
                <td class="p-2 align-top border-l border-gray-300 bg-gray-50/50">${taoNhomCheckbox(DANH_SACH_NUT_CHUC_NANG, nutChon, 'nut')}</td>
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
    if (!confirm("Đồng chí chắc chắn muốn thu hồi phân quyền của định danh này?")) return;
    let tr = btn.closest('tr');
    let index = parseInt(tr.getAttribute('data-index'), 10);
    if (!isNaN(index)) {
        duLieuBangPhanQuyen.splice(index, 1);
        hienThiBangPhanQuyen();
    }
}

async function luuDuLieuPhanQuyenSangMayChu() {
    let mangGhi = [];
    let cacDong = document.querySelectorAll('.dong-phan-quyen');
    
    cacDong.forEach(tr => {
        let taiKhoan = tr.querySelector('.input-tai-khoan').value.trim();
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
            hienThiBangPhanQuyen();
        } else {
            alert("Lưu thất bại: " + kq.thongBao);
        }
    } catch (loi) {
        alert("Có sự cố kết nối máy chủ: " + loi.message);
    } finally {
        if (btnLuu) { btnLuu.innerHTML = textGoc; btnLuu.disabled = false; }
    }
}
