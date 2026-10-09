// =========================================================================
// TIỆN ÍCH HỆ THỐNG: KIỂM TRA SỔ ĐẦU BÀI (KiemTraSoDauBai.js)
// Tính năng:
// 1. Tự động gắn Menu "9. Kiểm tra sổ đầu bài" vào vùng Hệ thống & Ma trận Phân quyền
// 2. Bộ lọc: Năm học, Từ tuần đến tuần (vừa gõ vừa chọn kể cả khi đang có dữ liệu)
// 3. Bảng dữ liệu: Tuần | Lớp (chỉ lớp chưa hoàn thiện) | Tiết học & Môn | Lý do chưa hoàn thành
// 4. Tuyệt đối độc lập, an toàn, không xung đột hay làm hỏng bất kỳ chức năng nào có sẵn
// =========================================================================

let duLieuGopKiemTraSDB = [];
let dangTaiDuLieuKTSDB = false;
let daNapDuLieuKTSDB = false;

// Cấu hình các bộ lọc hiện tại
let boLocHienTai_KTSDB = {
    namHoc: '',
    tuTuan: 1,
    denTuan: 1,
    lop: 'Tất cả'
};

// =========================================================================
// KHỐI 1: KHỞI TẠO DOM, MENU & TÍCH HỢP MA TRẬN PHÂN QUYỀN
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    khoiTaoModuleKiemTraSoDauBai();
});

// Chạy thêm dự phòng nếu script được nạp sau khi DOM đã sẵn sàng
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    khoiTaoModuleKiemTraSoDauBai();
}

function khoiTaoModuleKiemTraSoDauBai() {
    dangKyVaoMaTranPhanQuyen();
    taoMenuKiemTraSoDauBai();
    taoKhungGiaoDienKiemTraSDB();
    ganKetHeThongKiemSoatKTSDB();

    // Lắng nghe cập nhật định kỳ mỗi giây để đảm bảo menu luôn xuất hiện đúng quyền sau khi đăng nhập
    setInterval(() => {
        capNhatHienThiMenuKiemTraSDB();
    }, 1000);
}

// 1. Tự động đăng ký Menu vào Ma trận phân quyền để Tab "8. Phân quyền Hệ thống" tự có Checkbox
function dangKyVaoMaTranPhanQuyen() {
    if (typeof DANH_SACH_MENU_HE_THONG !== 'undefined' && Array.isArray(DANH_SACH_MENU_HE_THONG)) {
        let daCo = DANH_SACH_MENU_HE_THONG.some(m => m.id === 'menuKiemTraSoDauBai');
        if (!daCo) {
            DANH_SACH_MENU_HE_THONG.push({ id: 'menuKiemTraSoDauBai', ten: '9. Kiểm tra SĐB' });
        }
    }
}

// 2. Chèn Menu vào thanh điều hướng bên trái (dưới mục "8. Phân quyền Hệ thống")
function taoMenuKiemTraSoDauBai() {
    let nav = document.querySelector('nav');
    if (!nav) return;

    if (!document.getElementById('menuKiemTraSoDauBai')) {
        let menuHTML = document.createElement('a');
        menuHTML.id = 'menuKiemTraSoDauBai';
        menuHTML.onclick = moTabKiemTraSoDauBai;
        menuHTML.style.display = 'none'; // Mặc định ẩn, sẽ được hàm phân quyền mở khi đủ điều kiện
        menuHTML.className = 'flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-white/10 transition-all duration-150 cursor-pointer group';
        menuHTML.innerHTML = `
            <svg class="w-5 h-5 flex-none opacity-70 group-hover:opacity-100 transition-opacity text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span class="font-bold text-white/80 group-hover:text-white transition-colors text-[14px] whitespace-nowrap">9. Kiểm tra sổ đầu bài</span>
        `;
        
        let menuPhanQuyen = document.getElementById('menuPhanQuyen');
        if (menuPhanQuyen && menuPhanQuyen.parentNode) {
            menuPhanQuyen.insertAdjacentElement('afterend', menuHTML);
        } else {
            nav.appendChild(menuHTML);
        }
    }
}

// 3. Khởi tạo Khung giao diện chứa bộ lọc và bảng dữ liệu trong vùng nội dung chính
function taoKhungGiaoDienKiemTraSDB() {
    let vungChinh = document.getElementById('vungHienThiChinh');
    if (!vungChinh || document.getElementById('khungKiemTraSoDauBai')) return;

    let khungHTML = document.createElement('div');
    khungHTML.id = 'khungKiemTraSoDauBai';
    khungHTML.className = 'hidden p-4 w-full h-full flex-col font-sans bg-gray-50 reactbits-fade-in relative';
    khungHTML.innerHTML = `
        <!-- TIÊU ĐỀ KHUNG VÀ NÚT TÁC VỤ -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 gap-3 flex-none">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 text-blue-900 rounded-xl shadow-sm border border-blue-200">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                </div>
                <div>
                    <h2 class="text-xl font-extrabold text-blue-900 uppercase tracking-wide">KIỂM TRA HOÀN THÀNH SỔ ĐẦU BÀI</h2>
                    <p class="text-xs text-slate-500 font-semibold mt-0.5">Rà soát chi tiết những lớp chưa đầy đủ dữ liệu: Tên bài dạy, Nhận xét GV, Ký tên</p>
                </div>
            </div>

            <!-- NHÓM NÚT XUẤT BÁO CÁO & ĐỒNG BỘ -->
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="taiLaiDuLieuKTSDB()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 text-xs shadow transition duration-200 rounded flex items-center gap-1.5" title="Tải lại dữ liệu mới nhất từ máy chủ">
                    <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Tải lại
                </button>
                <button onclick="xuatExcelKiemTraSoDauBai()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 text-xs shadow transition duration-200 rounded flex items-center gap-1.5" title="Xuất báo cáo các lớp chưa hoàn thành ra tệp Excel">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Xuất Excel
                </button>
                <button onclick="inBaoCaoKiemTraSoDauBai()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 text-xs shadow transition duration-200 rounded flex items-center gap-1.5" title="In trực tiếp biểu mẫu theo dõi SĐB">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    In Báo Cáo
                </button>
            </div>
        </div>

        <!-- THANH CÔNG CỤ BỘ LỌC (VỪA GÕ VỪA CHỌN KỂ CẢ KHI CÓ DỮ LIỆU) -->
        <div class="bg-white border border-gray-300 shadow-sm p-3 rounded-lg flex flex-wrap items-end gap-3 mb-3 flex-none">
            <!-- Ô LỌC NĂM HỌC -->
            <div class="flex flex-col">
                <label class="text-[11px] text-gray-500 uppercase font-extrabold mb-1">Năm học</label>
                <div id="container_locNamHoc_KTSDB" class="relative inline-block w-36"></div>
            </div>

            <!-- Ô LỌC TỪ TUẦN -->
            <div class="flex flex-col">
                <label class="text-[11px] text-gray-500 uppercase font-extrabold mb-1">Từ tuần</label>
                <div id="container_locTuTuan_KTSDB" class="relative inline-block w-32"></div>
            </div>

            <!-- Ô LỌC ĐẾN TUẦN -->
            <div class="flex flex-col">
                <label class="text-[11px] text-gray-500 uppercase font-extrabold mb-1">Đến tuần</label>
                <div id="container_locDenTuan_KTSDB" class="relative inline-block w-32"></div>
            </div>

            <!-- NÚT THỰC THI KIỂM TRA -->
            <button onclick="thucThiKiemTraSoDauBai()" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-1.5 px-6 rounded shadow transition duration-200 text-sm flex items-center gap-2 h-[34px] ml-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                Kiểm tra
            </button>

            <!-- Ô TÌM KIẾM NHANH TRÊN KẾT QUẢ -->
            <div class="flex-1 min-w-[200px] ml-auto">
                <label class="text-[11px] text-gray-500 uppercase font-extrabold mb-1 block">Tìm nhanh kết quả</label>
                <div class="relative">
                    <input type="text" id="timNhanhKTSDB" oninput="locKetQuaNhanhKTSDB()" placeholder="Lọc theo Lớp, Môn hoặc Giáo viên..." class="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white placeholder-slate-400">
                    <svg class="w-4 h-4 absolute left-2.5 top-2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>
        </div>

        <!-- THẺ THỐNG KÊ NHANH TỔNG HỢP -->
        <div id="theThongKeTongHop_KTSDB" class="mb-3 hidden"></div>

        <!-- BẢNG KẾT QUẢ DỮ LIỆU -->
        <div class="flex-1 overflow-auto border border-gray-400 shadow-sm bg-white relative rounded">
            <table id="bangKiemTraSDB" class="bang-excel w-full text-center border-collapse">
                <thead class="sticky top-0 z-20 bg-slate-200 text-slate-900 shadow-sm border-b-2 border-slate-400" style="font-family:'Times New Roman',Times,serif;">
                    <tr>
                        <th class="py-2.5 px-2 border border-slate-400 w-20 text-center font-bold">Tuần</th>
                        <th class="py-2.5 px-3 border border-slate-400 w-24 text-center font-bold">Lớp</th>
                        <th class="py-2.5 px-3 border border-slate-400 w-44 text-center font-bold">Tiết học (Thời điểm)</th>
                        <th class="py-2.5 px-3 border border-slate-400 w-60 text-center font-bold">Môn & Giáo viên phụ trách</th>
                        <th class="py-2.5 px-4 border border-slate-400 text-left font-bold min-w-[320px]">Lý do chưa hoàn thành sổ</th>
                        <th class="py-2.5 px-2 border border-slate-400 w-28 text-center font-bold">Tác vụ</th>
                    </tr>
                </thead>
                <tbody id="vungDuLieuKiemTraSDB" style="font-family:'Times New Roman',Times,serif;">
                    <tr>
                        <td colspan="6" class="text-center py-12 text-slate-500 font-bold italic">
                            Vui lòng chọn Năm học, khoảng Tuần và bấm nút "Kiểm tra" để quét dữ liệu.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    vungChinh.appendChild(khungHTML);
}

// 4. Kiểm soát phân quyền hiển thị Menu "Kiểm tra sổ đầu bài"
function capNhatHienThiMenuKiemTraSDB() {
    let menuKTSDB = document.getElementById('menuKiemTraSoDauBai');
    if (!menuKTSDB) return;

    let coQuyenQuanTri = (typeof quyenSuaChua !== 'undefined' && quyenSuaChua);
    let quyenCongKhai = (typeof layQuyenCongKhaiHienTai === 'function') ? layQuyenCongKhaiHienTai() : { menu: [], nut: [], lop: [] };
    let menuCongKhai = quyenCongKhai.menu || [];
    let menuDuocCap = (typeof quyenChiTiet !== 'undefined' && quyenChiTiet.menu) ? quyenChiTiet.menu : [];

    let duocXem = coQuyenQuanTri || menuDuocCap.includes('menuKiemTraSoDauBai') || menuCongKhai.includes('menuKiemTraSoDauBai');
    menuKTSDB.style.display = duocXem ? 'flex' : 'none';

    let nhanHT = document.getElementById('nhanHeThong');
    if (nhanHT && duocXem) {
        nhanHT.style.display = 'flex';
    }
}

// 5. Hook an toàn vào hệ thống kiểm soát quyền chung (Chống lặp đệ quy)
function ganKetHeThongKiemSoatKTSDB() {
    if (typeof window.kiemSoatGiaoDien === 'function' && !window.kiemSoatGiaoDien._daHookKiemTraSDB) {
        const kiemSoatGoc = window.kiemSoatGiaoDien;
        const hamBaoVe = function() {
            try {
                kiemSoatGoc.apply(this, arguments);
            } finally {
                capNhatHienThiMenuKiemTraSDB();
            }
        };
        hamBaoVe._daHookKiemTraSDB = true;
        window.kiemSoatGiaoDien = hamBaoVe;
    }
}

// =========================================================================
// KHỐI 2: ĐIỀU HƯỚNG TAB & KHỞI TẠO BỘ LỌC
// =========================================================================
window.moTabKiemTraSoDauBai = function() {
    if (typeof kichHoatTab === 'function') {
        kichHoatTab('menuKiemTraSoDauBai', 'khungKiemTraSoDauBai', false);
    } else {
        document.querySelectorAll('nav a').forEach(m => m.classList.remove('bg-white/10'));
        let mActive = document.getElementById('menuKiemTraSoDauBai');
        if (mActive) mActive.classList.add('bg-white/10');
        
        let vungChinh = document.getElementById('vungHienThiChinh');
        if (vungChinh) {
            Array.from(vungChinh.children).forEach(el => el.classList.add('hidden'));
        }
        let khung = document.getElementById('khungKiemTraSoDauBai');
        if (khung) khung.classList.remove('hidden');
    }

    // Ẩn thanh công cụ TKB nếu đang mở
    let thanhTKB = document.getElementById('thanhCongCuTKB');
    if (thanhTKB) {
        thanhTKB.classList.remove('flex');
        thanhTKB.classList.add('hidden');
    }

    // Tự động nạp bộ lọc và dữ liệu lần đầu
    khoiTaoBoLocKiemTraSDB();
};

// Lắng nghe sự kiện chuyển menu để tự động ẩn khung khi bấm tab khác
document.addEventListener('click', function(e) {
    let menuClicked = e.target.closest('nav a');
    if (menuClicked && menuClicked.id !== 'menuKiemTraSoDauBai') {
        let khung = document.getElementById('khungKiemTraSoDauBai');
        if (khung && !khung.classList.contains('hidden')) {
            khung.classList.add('hidden');
            khung.classList.remove('flex');
        }
    }
});

// =========================================================================
// KHỐI 3: COMPONENT BỘ LỌC "VỪA GÕ VỪA CHỌN KỂ CẢ KHI CÓ DỮ LIỆU"
// =========================================================================
function taoBoLocVuaGoVuaChon_KTSDB(config) {
    const { idContainer, idInput, idList, danhSach, giaTriMacDinh, placeholder, onSelect } = config;
    const container = document.getElementById(idContainer);
    if (!container) return;

    container.innerHTML = `
        <input type="text" id="${idInput}" 
               autocomplete="off" 
               class="w-full px-2.5 py-1.5 pr-7 text-xs border border-blue-400 rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white font-extrabold text-blue-900 placeholder-slate-400 cursor-pointer text-center" 
               placeholder="${placeholder || 'Chọn...'}">
        <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
        <ul id="${idList}" class="absolute z-[999] w-full mt-1 max-h-56 overflow-y-auto overscroll-contain bg-white border border-blue-400 rounded-md shadow-2xl hidden divide-y divide-slate-100 left-0 text-left"></ul>
    `;

    const inputEl = document.getElementById(idInput);
    const listEl = document.getElementById(idList);

    // Gán giá trị mặc định ban đầu
    let itemMacDinh = danhSach.find(d => String(d.value) === String(giaTriMacDinh)) || danhSach[0];
    if (itemMacDinh) {
        inputEl.value = itemMacDinh.text;
        inputEl.dataset.val = itemMacDinh.value;
    }

    function renderOptions(tuKhoa) {
        listEl.innerHTML = '';
        let tk = (tuKhoa || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        let matchCount = 0;

        danhSach.forEach(item => {
            let txt = item.text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (tk === '' || txt.includes(tk) || String(item.value).includes(tk)) {
                matchCount++;
                let li = document.createElement('li');
                let laDangChon = String(item.value) === String(inputEl.dataset.val);
                li.className = `px-3 py-2 cursor-pointer transition-colors text-xs font-bold flex justify-between items-center ${laDangChon ? 'bg-blue-100 text-blue-800' : 'text-slate-700 hover:bg-blue-50'}`;
                li.innerHTML = `<span>${item.text}</span>` + (laDangChon ? `<svg class="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>` : '');
                
                li.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    inputEl.value = item.text;
                    inputEl.dataset.val = item.value;
                    listEl.classList.add('hidden');
                    inputEl.blur();
                    if (typeof onSelect === 'function') onSelect(item.value, item.text);
                });
                listEl.appendChild(li);
            }
        });

        if (matchCount === 0) {
            let li = document.createElement('li');
            li.className = 'px-3 py-2 text-xs text-red-500 italic text-center font-semibold bg-slate-50';
            li.innerText = 'Không tìm thấy...';
            listEl.appendChild(li);
        }
    }

    // TÍNH NĂNG VÀNG: Bấm vào là bôi đen và mở danh sách ngay, gõ đè trực tiếp mà không cần xóa tay
    inputEl.addEventListener('focus', () => {
        inputEl.dataset.oldValue = inputEl.value;
        setTimeout(() => { inputEl.select(); }, 30);
        renderOptions('');
        listEl.classList.remove('hidden');
    });

    inputEl.addEventListener('click', () => {
        renderOptions('');
        listEl.classList.remove('hidden');
        inputEl.select();
    });

    inputEl.addEventListener('input', (e) => {
        renderOptions(e.target.value);
        listEl.classList.remove('hidden');
    });

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            listEl.classList.add('hidden');
            inputEl.blur();
        }
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            listEl.classList.add('hidden');
            // Nếu người dùng xóa trắng rồi bấm ra ngoài, phục hồi giá trị cũ
            if (inputEl.value.trim() === '') {
                let itemKhoiPhuc = danhSach.find(d => String(d.value) === String(inputEl.dataset.val));
                if (itemKhoiPhuc) inputEl.value = itemKhoiPhuc.text;
            }
        }
    });
}

// Khởi tạo các giá trị danh mục cho 3 ô lọc
function khoiTaoBoLocKiemTraSDB() {
    let namHocHienTai = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC) ? thongSoHocVu.NAM_HOC : '2026-2027';
    let tuanHienTai = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.TUAN_HIEN_TAI) ? parseInt(thongSoHocVu.TUAN_HIEN_TAI, 10) : 1;
    if (isNaN(tuanHienTai) || tuanHienTai < 1) tuanHienTai = 1;

    // 1. Danh sách Năm học
    let dsNam = [];
    let namBatDau = parseInt(namHocHienTai.split('-')[0], 10) || 2026;
    for (let y = namBatDau - 2; y <= namBatDau + 2; y++) {
        let textNam = `${y}-${y + 1}`;
        dsNam.push({ value: textNam, text: `Năm ${textNam}` });
    }
    boLocHienTai_KTSDB.namHoc = namHocHienTai;

    taoBoLocVuaGoVuaChon_KTSDB({
        idContainer: 'container_locNamHoc_KTSDB',
        idInput: 'input_locNamHoc_KTSDB',
        idList: 'list_locNamHoc_KTSDB',
        danhSach: dsNam,
        giaTriMacDinh: namHocHienTai,
        placeholder: 'Chọn năm...',
        onSelect: (val) => {
            boLocHienTai_KTSDB.namHoc = val;
        }
    });

    // 2. Danh sách Tuần (1 đến 35 tuần phổ thông hoặc 52 tuần)
    let dsTuan = [];
    for (let t = 1; t <= 35; t++) {
        dsTuan.push({ value: t, text: `Tuần ${t}` });
    }

    boLocHienTai_KTSDB.tuTuan = 1;
    boLocHienTai_KTSDB.denTuan = tuanHienTai;

    taoBoLocVuaGoVuaChon_KTSDB({
        idContainer: 'container_locTuTuan_KTSDB',
        idInput: 'input_locTuTuan_KTSDB',
        idList: 'list_locTuTuan_KTSDB',
        danhSach: dsTuan,
        giaTriMacDinh: 1,
        placeholder: 'Từ tuần...',
        onSelect: (val) => {
            boLocHienTai_KTSDB.tuTuan = parseInt(val, 10);
            if (boLocHienTai_KTSDB.tuTuan > boLocHienTai_KTSDB.denTuan) {
                // Tự động điều chỉnh Đến tuần nếu Từ tuần lớn hơn
                let inputDen = document.getElementById('input_locDenTuan_KTSDB');
                if (inputDen) {
                    inputDen.value = `Tuần ${val}`;
                    inputDen.dataset.val = val;
                    boLocHienTai_KTSDB.denTuan = parseInt(val, 10);
                }
            }
        }
    });

    taoBoLocVuaGoVuaChon_KTSDB({
        idContainer: 'container_locDenTuan_KTSDB',
        idInput: 'input_locDenTuan_KTSDB',
        idList: 'list_locDenTuan_KTSDB',
        danhSach: dsTuan,
        giaTriMacDinh: tuanHienTai,
        placeholder: 'Đến tuần...',
        onSelect: (val) => {
            boLocHienTai_KTSDB.denTuan = parseInt(val, 10);
            if (boLocHienTai_KTSDB.denTuan < boLocHienTai_KTSDB.tuTuan) {
                let inputTu = document.getElementById('input_locTuTuan_KTSDB');
                if (inputTu) {
                    inputTu.value = `Tuần ${val}`;
                    inputTu.dataset.val = val;
                    boLocHienTai_KTSDB.tuTuan = parseInt(val, 10);
                }
            }
        }
    });
}

// =========================================================================
// KHỐI 4: TẢI VÀ TỔNG HỢP DỮ LIỆU TỪ MÁY CHỦ
// =========================================================================
async function taiDuLieuTongHopKiemTraSDB(epBuocTaiMoi = false) {
    if (dangTaiDuLieuKTSDB) return duLieuGopKiemTraSDB;

    // Nếu đã có dữ liệu và không yêu cầu tải mới thì sử dụng lại
    if (!epBuocTaiMoi && daNapDuLieuKTSDB && duLieuGopKiemTraSDB.length > 0) {
        return duLieuGopKiemTraSDB;
    }

    // Nếu module SoDauBai.js đã nạp sẵn mảng duLieuTKBGopDaMap và hợp lệ
    if (!epBuocTaiMoi && typeof duLieuTKBGopDaMap !== 'undefined' && Array.isArray(duLieuTKBGopDaMap) && duLieuTKBGopDaMap.length > 0) {
        duLieuGopKiemTraSDB = duLieuTKBGopDaMap;
        daNapDuLieuKTSDB = true;
        return duLieuGopKiemTraSDB;
    }

    dangTaiDuLieuKTSDB = true;
    let vungHienThi = document.getElementById('vungDuLieuKiemTraSDB');
    if (vungHienThi) {
        vungHienThi.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-12 text-blue-600 font-bold">
                    <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                    Đang đồng bộ dữ liệu Sổ đầu bài và Thời khoá biểu từ máy chủ...
                </td>
            </tr>
        `;
    }

    try {
        let emailGoi = (typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' && window.dinhDanhGiaoVienToanCuc !== '') 
            ? window.dinhDanhGiaoVienToanCuc 
            : (typeof window.emailGiaoVienToanCuc !== 'undefined' ? window.emailGiaoVienToanCuc : '');

        let urlAPI = `${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDuLieuSoDauBai&emailTruyCap=${encodeURIComponent(emailGoi)}&taiToanBo=false`;
        const phanHoi = await (typeof fetchVoiCoCheThuLai === 'function' ? fetchVoiCoCheThuLai(urlAPI) : fetch(urlAPI));
        const ketQua = await phanHoi.json();

        if (ketQua.trangThai === 'loi_he_thong') throw new Error(ketQua.thongBao);

        // Hợp nhất dữ liệu TKB (DATA_TKB + TKB_HIEN_TAI) và Sổ đầu bài (SO_DAU_BAI)
        let mapHopNhat = {};

        const chuanHoaThu = (thuStr) => {
            if (!thuStr) return '';
            let raw = String(thuStr).trim().toLowerCase();
            return raw.charAt(0).toUpperCase() + raw.slice(1);
        };

        // 1. Đọc Sổ đầu bài thực tế
        if (ketQua.SO_DAU_BAI && Array.isArray(ketQua.SO_DAU_BAI)) {
            let namHocHienTai = ketQua.NAM_HOC || (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC) || '';
            
            ketQua.SO_DAU_BAI.forEach(dong => {
                let maLuuTru = String(dong['A'] || '').trim();
                let tuan = parseInt(String(dong['B'] || '').replace(/\D/g, ''), 10) || 0;
                let lop = String(dong['C'] || '').trim().toUpperCase();
                let thuChuan = chuanHoaThu(dong['D'] || '');
                let ngay = String(dong['E'] || '').trim();
                let buoi = String(dong['F'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều';
                let tiet = String(dong['G'] || '').trim();

                // Lọc theo năm học nếu có tiền tố mã lưu trữ
                let namCuaDong = namHocHienTai;
                if (/^\d{4}-\d{4}_/.test(maLuuTru)) {
                    namCuaDong = maLuuTru.split('_')[0];
                }

                let khoa = `${namCuaDong}_${tuan}_${lop}_${thuChuan}_${buoi}_${tiet}`;

                mapHopNhat[khoa] = {
                    namHoc: namCuaDong,
                    'Tuần': String(tuan),
                    'Mã Lớp': lop,
                    'Thứ': thuChuan,
                    'Buổi': buoi,
                    'Tiết': tiet,
                    'Môn Học': dong['H'] || '',
                    'Mã GV': '',
                    'Ngày': ngay,
                    'TietPPCT_Thuc': dong['I'] || '',
                    'TenBai_Thuc': dong['J'] || '',
                    'NhanXet_Thuc': dong['K'] || '',
                    'XepLoai_Thuc': dong['L'] || '',
                    'ChuKy_Thuc': dong['M'] || '',
                    'ChuyenCan_Thuc': dong['N'] || '',
                    'DaLuu': true
                };
            });
        }

        // 2. Đọc Thời khoá biểu để xác định toàn bộ các tiết CÓ MÔN HỌC cần phải ghi sổ
        let mapTkb = {};
        let tuanHeThong = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.TUAN_HIEN_TAI) ? parseInt(thongSoHocVu.TUAN_HIEN_TAI, 10) : 1;
        let namHocChuan = ketQua.NAM_HOC || (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC) || '';

        const napTkbVaoMap = (dong) => {
            let tuanDong = parseInt(String(dong['C'] || '').replace(/\D/g, ''), 10) || 0;
            let lop = String(dong['G'] || '').trim().toUpperCase();
            let thu = chuanHoaThu(dong['D'] || '');
            let buoi = String(dong['E'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều';
            let tiet = String(dong['F'] || '').trim();
            let mon = String(dong['H'] || '').trim();
            let gv = String(dong['I'] || '').trim();
            let ngay = String(dong['K'] || '').trim();

            if (mon !== '' && mon !== '--' && mon !== '---') {
                let khoa = `${namHocChuan}_${tuanDong}_${lop}_${thu}_${buoi}_${tiet}`;
                mapTkb[khoa] = {
                    namHoc: namHocChuan,
                    'Tuần': String(tuanDong),
                    'Mã Lớp': lop,
                    'Thứ': thu,
                    'Buổi': buoi,
                    'Tiết': tiet,
                    'Môn Học': mon,
                    'Mã GV': gv,
                    'Ngày': ngay
                };
            }
        };

        if (ketQua.DATA_TKB && Array.isArray(ketQua.DATA_TKB)) {
            ketQua.DATA_TKB.forEach(napTkbVaoMap);
        }
        if (ketQua.TKB_HIEN_TAI && Array.isArray(ketQua.TKB_HIEN_TAI)) {
            ketQua.TKB_HIEN_TAI.forEach(napTkbVaoMap);
        }

        // 3. Kết hợp TKB với SĐB: Tiết nào có trong TKB mà chưa có trong SĐB thì coi như chưa vào sổ
        Object.keys(mapTkb).forEach(khoa => {
            let itemTkb = mapTkb[khoa];
            if (!mapHopNhat[khoa]) {
                mapHopNhat[khoa] = {
                    namHoc: itemTkb.namHoc,
                    'Tuần': itemTkb['Tuần'],
                    'Mã Lớp': itemTkb['Mã Lớp'],
                    'Thứ': itemTkb['Thứ'],
                    'Buổi': itemTkb['Buổi'],
                    'Tiết': itemTkb['Tiết'],
                    'Môn Học': itemTkb['Môn Học'],
                    'Mã GV': itemTkb['Mã GV'],
                    'Ngày': itemTkb['Ngày'],
                    'TietPPCT_Thuc': '',
                    'TenBai_Thuc': '',
                    'NhanXet_Thuc': '',
                    'XepLoai_Thuc': '',
                    'ChuKy_Thuc': '',
                    'ChuyenCan_Thuc': '',
                    'DaLuu': false
                };
            } else {
                // Nếu trong SĐB chưa có Mã GV, bù trừ từ TKB sang
                if (!mapHopNhat[khoa]['Mã GV'] || mapHopNhat[khoa]['Mã GV'].trim() === '') {
                    mapHopNhat[khoa]['Mã GV'] = itemTkb['Mã GV'];
                }
            }
        });

        duLieuGopKiemTraSDB = Object.values(mapHopNhat);
        daNapDuLieuKTSDB = true;
        return duLieuGopKiemTraSDB;

    } catch (loi) {
        console.error("Lỗi tải dữ liệu kiểm tra SĐB:", loi);
        if (vungHienThi) {
            vungHienThi.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-10 text-red-600 font-bold">
                        ⚠️ Sự cố tải dữ liệu: ${loi.message}. Vui lòng bấm "Tải lại" để thử lại.
                    </td>
                </tr>
            `;
        }
        return [];
    } finally {
        dangTaiDuLieuKTSDB = false;
    }
}

function taiLaiDuLieuKTSDB() {
    daNapDuLieuKTSDB = false;
    duLieuGopKiemTraSDB = [];
    thucThiKiemTraSoDauBai(true);
}

// =========================================================================
// KHỐI 5: THUẬT TOÁN QUÉT VÀ ĐỐI CHIẾU KIỂM TRA SỔ ĐẦU BÀI
// =========================================================================
async function thucThiKiemTraSoDauBai(epBuocTaiMoi = false) {
    let inputTu = document.getElementById('input_locTuTuan_KTSDB');
    let inputDen = document.getElementById('input_locDenTuan_KTSDB');
    let inputNam = document.getElementById('input_locNamHoc_KTSDB');

    let tuTuan = inputTu ? parseInt(inputTu.dataset.val || inputTu.value.replace(/\D/g, ''), 10) : boLocHienTai_KTSDB.tuTuan;
    let denTuan = inputDen ? parseInt(inputDen.dataset.val || inputDen.value.replace(/\D/g, ''), 10) : boLocHienTai_KTSDB.denTuan;
    let namHoc = inputNam ? (inputNam.dataset.val || boLocHienTai_KTSDB.namHoc) : boLocHienTai_KTSDB.namHoc;

    if (isNaN(tuTuan) || tuTuan < 1) tuTuan = 1;
    if (isNaN(denTuan) || denTuan < 1) denTuan = tuTuan;

    if (tuTuan > denTuan) {
        alert("Cảnh báo: 'Từ tuần' không được lớn hơn 'Đến tuần'. Hệ thống tự động hoán vị.");
        let temp = tuTuan;
        tuTuan = denTuan;
        denTuan = temp;
        if (inputTu) { inputTu.value = `Tuần ${tuTuan}`; inputTu.dataset.val = tuTuan; }
        if (inputDen) { inputDen.value = `Tuần ${denTuan}`; inputDen.dataset.val = denTuan; }
    }

    boLocHienTai_KTSDB.tuTuan = tuTuan;
    boLocHienTai_KTSDB.denTuan = denTuan;
    boLocHienTai_KTSDB.namHoc = namHoc;

    // Tải dữ liệu
    let danhSachTiet = await taiDuLieuTongHopKiemTraSDB(epBuocTaiMoi);
    if (!danhSachTiet || danhSachTiet.length === 0) return;

    // Lọc theo Năm học và khoảng Tuần
    let danhSachKiemTra = danhSachTiet.filter(dong => {
        let t = parseInt(String(dong['Tuần']).replace(/\D/g, ''), 10) || 0;
        let mon = String(dong['Môn Học'] || '').trim();
        
        // Chỉ kiểm tra các tiết có lịch phân môn thực tế
        if (mon === '' || mon === '--' || mon === '---') return false;

        // So khớp tuần
        if (t < tuTuan || t > denTuan) return false;

        // So khớp năm học nếu có thông tin
        if (namHoc && dong.namHoc && dong.namHoc !== '' && dong.namHoc !== namHoc) {
            return false;
        }

        return true;
    });

    // =====================================================================
    // QUY TRÌNH ĐÁNH GIÁ TIẾT HỌC HOÀN THÀNH HAY CHƯA
    // Tiêu chí chưa hoàn thành:
    // 1. Thiếu tên bài học (tenBai trống hoặc chỉ có -- / ...)
    // 2. Chưa nhận xét GV (nhanXet trống hoặc chỉ có -- / ...)
    // 3. Chưa ký tên (chuKy trống hoặc chỉ có -- / ...)
    // =====================================================================
    let baoCaoTheoTuanVaLop = {}; // Cấu trúc: { tuan: { lop: [dsTietLoi] } }
    let tongTietChuaXong = 0;
    let tongThieuTenBai = 0;
    let tongChuaNhanXet = 0;
    let tongChuaKy = 0;
    let tapHopLopChuaXong = new Set();

    danhSachKiemTra.forEach(tietHoc => {
        let tuanSo = parseInt(String(tietHoc['Tuần']).replace(/\D/g, ''), 10);
        let maLop = String(tietHoc['Mã Lớp'] || '').trim().toUpperCase();
        let monHoc = String(tietHoc['Môn Học'] || '').trim();
        let maGv = String(tietHoc['Mã GV'] || '').trim();
        let thu = String(tietHoc['Thứ'] || '').trim();
        let buoi = String(tietHoc['Buổi'] || '').trim();
        let tiet = String(tietHoc['Tiết'] || '').trim();
        let ngay = String(tietHoc['Ngày'] || '').trim();

        let tenBai = String(tietHoc['TenBai_Thuc'] || '').trim();
        let nhanXet = String(tietHoc['NhanXet_Thuc'] || '').trim();
        let chuKy = String(tietHoc['ChuKy_Thuc'] || '').trim();

        let thieuTenBai = (tenBai === '' || tenBai === '--' || tenBai === '...' || tenBai.toLowerCase().startsWith('chưa có dữ liệu'));
        let thieuNhanXet = (nhanXet === '' || nhanXet === '--' || nhanXet === '...');
        let thieuChuKy = (chuKy === '' || chuKy === '--' || chuKy === '...');

        // Nếu phát sinh bất kỳ lỗi nào trong 3 tiêu chuẩn trên
        if (thieuTenBai || thieuNhanXet || thieuChuKy) {
            let lyDoList = [];
            if (thieuTenBai) { lyDoList.push({ ma: 'TEN_BAI', text: 'Thiếu tên bài học', mau: 'bg-purple-100 text-purple-800 border-purple-300' }); tongThieuTenBai++; }
            if (thieuNhanXet) { lyDoList.push({ ma: 'NHAN_XET', text: 'Chưa nhận xét', mau: 'bg-amber-100 text-amber-800 border-amber-300' }); tongChuaNhanXet++; }
            if (thieuChuKy) { lyDoList.push({ ma: 'CHU_KY', text: 'Chưa ký tên', mau: 'bg-rose-100 text-rose-800 border-rose-300' }); tongChuaKy++; }

            if (!baoCaoTheoTuanVaLop[tuanSo]) baoCaoTheoTuanVaLop[tuanSo] = {};
            if (!baoCaoTheoTuanVaLop[tuanSo][maLop]) baoCaoTheoTuanVaLop[tuanSo][maLop] = [];

            baoCaoTheoTuanVaLop[tuanSo][maLop].push({
                tuan: tuanSo,
                lop: maLop,
                thu: thu,
                buoi: buoi,
                tiet: tiet,
                ngay: ngay,
                monHoc: monHoc,
                maGv: maGv,
                tenBai: tenBai,
                nhanXet: nhanXet,
                chuKy: chuKy,
                lyDo: lyDoList
            });

            tongTietChuaXong++;
            tapHopLopChuaXong.add(`${tuanSo}_${maLop}`);
        }
    });

    // Cập nhật thẻ thống kê tổng hợp ở đầu trang
    renderThongKeTongHop(tuTuan, denTuan, tapHopLopChuaXong.size, tongTietChuaXong, tongThieuTenBai, tongChuaNhanXet, tongChuaKy);

    // Xuất bảng kết quả
    renderBangKetQuaKTSDB(baoCaoTheoTuanVaLop, tuTuan, denTuan);
}

// =========================================================================
// KHỐI 6: XUẤT BẢNG KẾT QUẢ VÀ HIỂN THỊ THỐNG KÊ
// =========================================================================
function renderThongKeTongHop(tuTuan, denTuan, soLopChuaXong, tongTiet, thieuTen, chuaNX, chuaKy) {
    let divTK = document.getElementById('theThongKeTongHop_KTSDB');
    if (!divTK) return;

    if (tongTiet === 0) {
        divTK.className = 'mb-3 p-3 bg-emerald-50 border-2 border-emerald-400 rounded-lg shadow-sm flex items-center justify-between animate-pulse-once';
        divTK.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="bg-emerald-600 text-white rounded-full p-2 shadow flex-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                    <h4 class="text-sm font-black text-emerald-900 uppercase tracking-wide">XUẤT SẮC: TẤT CẢ CÁC LỚP ĐỀU ĐÃ HOÀN THÀNH SỔ ĐẦU BÀI!</h4>
                    <p class="text-xs text-emerald-700 font-semibold mt-0.5">Từ Tuần ${tuTuan} đến Tuần ${denTuan}, 100% tiết dạy đã được nhập Tên bài, Nhận xét đánh giá và Ký tên đầy đủ.</p>
                </div>
            </div>
            <span class="text-xs font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-full uppercase tracking-wider">Đạt chuẩn 100%</span>
        `;
    } else {
        divTK.className = 'mb-3 p-3 bg-red-50 border-2 border-red-400 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3';
        divTK.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="bg-red-600 text-white rounded-full p-2 shadow flex-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                    <h4 class="text-sm font-black text-red-900 uppercase tracking-wide">PHÁT HIỆN ${soLopChuaXong} LƯỢT LỚP CHƯA HOÀN THIỆN ĐẦY ĐỦ SỔ ĐẦU BÀI</h4>
                    <p class="text-xs text-red-700 font-semibold mt-0.5">Khoảng thời gian: Từ Tuần ${tuTuan} đến Tuần ${denTuan} • Tổng số tiết phát sinh vi phạm: <b class="text-red-900 font-black text-sm">${tongTiet} tiết</b></p>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded shadow-sm">Thiếu tên bài: <b>${thieuTen}</b></span>
                <span class="text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded shadow-sm">Chưa nhận xét: <b>${chuaNX}</b></span>
                <span class="text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-1 rounded shadow-sm">Chưa ký tên: <b>${chuaKy}</b></span>
            </div>
        `;
    }
    divTK.classList.remove('hidden');
}

function renderBangKetQuaKTSDB(baoCao, tuTuan, denTuan) {
    const tbody = document.getElementById('vungDuLieuKiemTraSDB');
    if (!tbody) return;

    let danhSachTuanCoLoi = Object.keys(baoCao).map(Number).sort((a, b) => a - b);

    if (danhSachTuanCoLoi.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-12 text-emerald-700 font-bold text-base">
                    🎉 Không có lớp nào vi phạm! Toàn bộ sổ đầu bài từ Tuần ${tuTuan} đến Tuần ${denTuan} đã hoàn thành đầy đủ.
                </td>
            </tr>
        `;
        return;
    }

    let bufferHTML = [];
    const thuTuThu = { "Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8 };

    danhSachTuanCoLoi.forEach(tuan => {
        let cacLopTrongTuan = Object.keys(baoCao[tuan]).sort();
        
        // Tính tổng số dòng hiển thị của cả Tuần để thiết lập rowspan
        let tongDongCuaTuan = 0;
        cacLopTrongTuan.forEach(lop => {
            tongDongCuaTuan += baoCao[tuan][lop].length;
        });

        let daInCotTuan = false;

        cacLopTrongTuan.forEach(lop => {
            let dsTietLoi = baoCao[tuan][lop];
            // Sắp xếp các tiết lỗi theo thứ tự thời gian học
            dsTietLoi.sort((a, b) => {
                let thA = thuTuThu[a.thu] || 99;
                let thB = thuTuThu[b.thu] || 99;
                if (thA !== thB) return thA - thB;
                let bA = a.buoi === 'sáng' || a.buoi === 'Sáng' ? 1 : 2;
                let bB = b.buoi === 'sáng' || b.buoi === 'Sáng' ? 1 : 2;
                if (bA !== bB) return bA - bB;
                return (parseInt(a.tiet, 10) || 0) - (parseInt(b.tiet, 10) || 0);
            });

            let soDongCuaLop = dsTietLoi.length;
            let daInCotLop = false;

            dsTietLoi.forEach((item, index) => {
                let isCuoiCungCuaLop = (index === soDongCuaLop - 1);
                let vienDayLop = isCuoiCungCuaLop ? 'border-b-2 border-slate-500' : 'border-b border-gray-300';

                bufferHTML.push(`<tr class="dong-du-lieu-ktsdb bg-white hover:bg-slate-50 transition-colors ${vienDayLop}" data-lop="${lop}" data-mon="${item.monHoc}" data-gv="${item.maGv}">`);

                // 1. CỘT TUẦN (Rowspan gộp dòng theo Tuần)
                if (!daInCotTuan) {
                    bufferHTML.push(`
                        <td rowspan="${tongDongCuaTuan}" class="text-center align-middle font-extrabold text-blue-900 bg-slate-50 border-r-2 border-b-2 border-slate-500 p-2">
                            <span class="text-base">Tuần ${tuan}</span>
                        </td>
                    `);
                    daInCotTuan = true;
                }

                // 2. CỘT LỚP (Rowspan gộp dòng theo Lớp)
                if (!daInCotLop) {
                    bufferHTML.push(`
                        <td rowspan="${soDongCuaLop}" class="text-center align-middle font-black text-slate-800 bg-white border-r border-b-2 border-slate-500 p-2">
                            <div class="text-base text-purple-900">${lop}</div>
                            <div class="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 mt-1 inline-block">
                                Thiếu ${soDongCuaLop} tiết
                            </div>
                        </td>
                    `);
                    daInCotLop = true;
                }

                // 3. CỘT TIẾT HỌC / THỜI ĐIỂM
                let textNgay = item.ngay ? `<span class="text-[11px] font-semibold text-slate-500">(${item.ngay})</span>` : '';
                bufferHTML.push(`
                    <td class="text-center align-middle border-r border-gray-300 p-2">
                        <div class="font-bold text-slate-800">${item.thu}, ${item.buoi}</div>
                        <div class="font-extrabold text-blue-700 text-sm">Tiết ${item.tiet} ${textNgay}</div>
                    </td>
                `);

                // 4. CỘT MÔN & GIÁO VIÊN
                let textGV = item.maGv ? `<div class="text-xs font-bold text-slate-700 mt-0.5">GV: <span class="text-indigo-900">${item.maGv}</span></div>` : '<div class="text-xs text-red-500 italic">Chưa xếp GV trong TKB</div>';
                bufferHTML.push(`
                    <td class="text-center align-middle border-r border-gray-300 p-2">
                        <div class="font-extrabold text-slate-900 text-sm">${item.monHoc}</div>
                        ${textGV}
                    </td>
                `);

                // 5. CỘT LÝ DO CHƯA HOÀN THÀNH SỔ
                let badgesLyDo = item.lyDo.map(ld => `
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-extrabold border ${ld.mau} shadow-xs">
                        <svg class="w-3 h-3 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        ${ld.text}
                    </span>
                `).join(' ');

                bufferHTML.push(`
                    <td class="text-left align-middle border-r border-gray-300 p-2.5">
                        <div class="flex flex-wrap gap-1.5 items-center">
                            ${badgesLyDo}
                        </div>
                    </td>
                `);

                // 6. CỘT TÁC VỤ: XEM TRỰC TIẾP TẠI SỔ ĐẦU BÀI ĐIỆN TỬ
                bufferHTML.push(`
                    <td class="text-center align-middle p-2">
                        <button onclick="chuyenHuongXemSDB(${tuan}, '${lop}')" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded border border-blue-300 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 mx-auto" title="Mở Sổ đầu bài Tuần ${tuan} của Lớp ${lop}">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            Xem SĐB
                        </button>
                    </td>
                `);

                bufferHTML.push(`</tr>`);
            });
        });
    });

    tbody.innerHTML = bufferHTML.join('');
}

// Chuyển hướng trực tiếp sang Sổ đầu bài điện tử của đúng Tuần và Lớp đó
window.chuyenHuongXemSDB = function(tuan, lop) {
    if (typeof kichHoatTab === 'function') {
        kichHoatTab('menuSoDauBai', 'khungSoDauBai', false);
    }
    
    setTimeout(() => {
        let selTuan = document.getElementById('chonTuanSo');
        let selLop = document.getElementById('chonLopSo');
        
        if (selTuan) {
            selTuan.value = String(tuan);
            if (typeof dongBoHienThiTuSelect === 'function') dongBoHienThiTuSelect('chonTuanSo');
        }
        if (selLop) {
            selLop.value = String(lop);
            if (typeof dongBoHienThiTuSelect === 'function') dongBoHienThiTuSelect('chonLopSo');
        }

        if (typeof ketXuatSoDauBaiLenLuoi === 'function') {
            ketXuatSoDauBaiLenLuoi();
        }
    }, 150);
};

// Tìm kiếm nhanh kết quả trên bảng kiểm tra
window.locKetQuaNhanhKTSDB = function() {
    let input = document.getElementById('timNhanhKTSDB');
    if (!input) return;

    let tuKhoa = input.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    let cacDong = document.querySelectorAll('#bangKiemTraSDB tbody tr.dong-du-lieu-ktsdb');

    cacDong.forEach(dong => {
        let lop = (dong.getAttribute('data-lop') || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let mon = (dong.getAttribute('data-mon') || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let gv = (dong.getAttribute('data-gv') || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let textToanDong = dong.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (tuKhoa === '' || lop.includes(tuKhoa) || mon.includes(tuKhoa) || gv.includes(tuKhoa) || textToanDong.includes(tuKhoa)) {
            dong.style.display = '';
        } else {
            dong.style.display = 'none';
        }
    });
};

// =========================================================================
// KHỐI 7: XUẤT EXCEL & IN ẤN BÁO CÁO CHUYÊN NGHIỆP
// =========================================================================
window.xuatExcelKiemTraSoDauBai = async function() {
    let cacDong = document.querySelectorAll('#bangKiemTraSDB tbody tr.dong-du-lieu-ktsdb');
    if (cacDong.length === 0) {
        alert("Không có dữ liệu lớp chưa hoàn thành để xuất Excel!");
        return;
    }

    try {
        if (typeof XLSX === 'undefined') {
            alert("Đang tải thư viện Excel, vui lòng thử lại sau 2 giây...");
            return;
        }

        let tuTuan = boLocHienTai_KTSDB.tuTuan;
        let denTuan = boLocHienTai_KTSDB.denTuan;
        let namHoc = boLocHienTai_KTSDB.namHoc;

        let rowsArr = [
            [`BÁO CÁO DANH SÁCH LỚP CHƯA HOÀN THÀNH SỔ ĐẦU BÀI`],
            [`Năm học: ${namHoc} - Giai đoạn kiểm tra: Từ Tuần ${tuTuan} đến Tuần ${denTuan}`],
            [`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`],
            [],
            ['STT', 'Tuần', 'Lớp', 'Thứ / Buổi / Tiết', 'Môn học', 'Giáo viên phụ trách', 'Lý do chưa hoàn thành']
        ];

        let stt = 1;
        cacDong.forEach(dong => {
            if (dong.style.display === 'none') return;

            let tuan = dong.querySelector('td:nth-child(1)') ? dong.querySelector('td:nth-child(1)').innerText.trim() : '';
            let lop = dong.getAttribute('data-lop') || '';
            let mon = dong.getAttribute('data-mon') || '';
            let gv = dong.getAttribute('data-gv') || '';
            
            // Đọc ô thời điểm và lý do
            let cacCell = dong.querySelectorAll('td');
            let cellThoiDiem = cacCell[cacCell.length - 4];
            let thoiDiemText = cellThoiDiem ? cellThoiDiem.innerText.replace(/\n/g, ' - ').trim() : '';

            let cellLyDo = cacCell[cacCell.length - 2];
            let lyDoText = cellLyDo ? cellLyDo.innerText.replace(/\n/g, '; ').trim() : '';

            rowsArr.push([stt++, tuan, lop, thoiDiemText, mon, gv, lyDoText]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rowsArr);

        // Định dạng độ rộng cột
        ws['!cols'] = [
            { wch: 6 },  // STT
            { wch: 12 }, // Tuần
            { wch: 10 }, // Lớp
            { wch: 25 }, // Thời điểm
            { wch: 20 }, // Môn
            { wch: 22 }, // Giáo viên
            { wch: 45 }  // Lý do
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Chua_Hoan_Thanh_SDB");
        XLSX.writeFile(wb, `KiemTra_SoDauBai_Tuan${tuTuan}_den_Tuan${denTuan}_${namHoc}.xlsx`);

    } catch (loi) {
        console.error("Lỗi xuất Excel:", loi);
        alert("Sự cố xuất tệp Excel: " + loi.message);
    }
};

window.inBaoCaoKiemTraSoDauBai = function() {
    let bang = document.getElementById('bangKiemTraSDB');
    if (!bang) return;

    let tuTuan = boLocHienTai_KTSDB.tuTuan;
    let denTuan = boLocHienTai_KTSDB.denTuan;
    let namHoc = boLocHienTai_KTSDB.namHoc;

    let cuaSoIn = window.open('', '_blank');
    cuaSoIn.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Báo cáo Kiểm tra Sổ đầu bài</title>
            <style>
                body { font-family: "Times New Roman", Times, serif; font-size: 13pt; margin: 20px; }
                h2, h3 { text-align: center; margin: 5px 0; text-transform: uppercase; }
                p { text-align: center; font-style: italic; margin-top: 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid black; padding: 6px 8px; font-size: 11pt; }
                th { background-color: #f2f2f2; text-align: center; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                button { display: none !important; }
            </style>
        </head>
        <body>
            <h2>BÁO CÁO DANH SÁCH LỚP CHƯA HOÀN THÀNH SỔ ĐẦU BÀI</h2>
            <h3>Năm học: ${namHoc} (Từ Tuần ${tuTuan} đến Tuần ${denTuan})</h3>
            <p>Thời điểm rà soát: ${new Date().toLocaleString('vi-VN')}</p>
            ${bang.outerHTML}
            <script>
                window.onload = function() {
                    // Xóa cột tác vụ cuối cùng khi in
                    document.querySelectorAll('th:last-child, td:last-child').forEach(el => el.remove());
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);
    cuaSoIn.document.close();
};