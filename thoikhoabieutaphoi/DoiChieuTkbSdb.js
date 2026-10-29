// =========================================================================
// TỆP ĐỘC LẬP: DoiChieuTkbSdb.js
// TÍNH NĂNG: ĐỐI CHIẾU & ĐỒNG BỘ CHênh LỆCH GIỮA SỔ ĐẦU BÀI VÀ THỜI KHÓA BIỂU TOÀN TRƯỜNG
// Nguyên tắc: Chạy 100% trên RAM/Cache đã nạp sẵn (Zero-Latency 0ms), không làm chậm hệ thống
// Thiết kế và phát triển Hoàng Ngọc Lâm
// =========================================================================

(function() {
    'use strict';

    // Biến lưu trữ kết quả quét gần nhất trên RAM
    let ketQuaDoiChieuToanCuc = [];
    let danhSachTuanCoDuLieu = [];
    let danhSachLopCoDuLieu = [];

    // -------------------------------------------------------------------------
    // 1. TỰ ĐỘNG GẮN NÚT CÔNG CỤ VÀ KHỞI TẠO MODAL TRÊN DOM (KHÔNG SỬA FILE GỐC)
    // -------------------------------------------------------------------------
    function khoiTaoGiaoDienDoiChieu() {
        // 1.1. Gắn nút vào Thanh công cụ Sổ đầu bài (#khungSoDauBai)
        const btnDongBoTenBai = document.getElementById('btnDongBoTenBai');
        if (btnDongBoTenBai && btnDongBoTenBai.parentElement && !document.getElementById('btnMoDoiChieuSDB')) {
            const btnSDB = document.createElement('button');
            btnSDB.id = 'btnMoDoiChieuSDB';
            btnSDB.type = 'button';
            btnSDB.onclick = function() { window.moModalDoiChieuTkbSdb('SDB'); };
            btnSDB.className = 'bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-2 text-xs shadow transition duration-200 rounded flex items-center gap-1.5 cursor-pointer';
            btnSDB.title = 'Kiểm tra và xử lý chênh lệch giữa Sổ đầu bài và Thời khóa biểu toàn trường (0ms)';
            btnSDB.innerHTML = `
                <svg class="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 3h5v5"></path><path d="M8 3H3v5"></path>
                    <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path>
                    <path d="m15 9 6-6"></path>
                </svg>
                <span>Đối chiếu TKB - SĐB</span>
            `;
            btnDongBoTenBai.parentElement.insertBefore(btnSDB, btnDongBoTenBai);
        }

        // 1.2. Gắn nút vào Thanh công cụ Thời khóa biểu (#thanhCongCuTKB)
        const btnKiemTraTienDo = document.getElementById('btnKiemTraTienDo');
        if (btnKiemTraTienDo && btnKiemTraTienDo.parentElement && !document.getElementById('btnMoDoiChieuTKB')) {
            const btnTKB = document.createElement('button');
            btnTKB.id = 'btnMoDoiChieuTKB';
            btnTKB.type = 'button';
            btnTKB.onclick = function() { window.moModalDoiChieuTkbSdb('TKB'); };
            btnTKB.className = 'bg-teal-700 hover:bg-teal-800 text-white font-bold px-3 py-1.5 text-sm shadow transition duration-200 items-center gap-1.5 rounded flex whitespace-nowrap flex-none group cursor-pointer';
            btnTKB.title = 'Kiểm tra sự khớp nhau giữa Thời khóa biểu và Sổ đầu bài các lớp';
            btnTKB.innerHTML = `
                <svg class="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span>Đối chiếu SĐB</span>
            `;
            btnKiemTraTienDo.parentElement.insertBefore(btnTKB, btnKiemTraTienDo.nextSibling);
        }

        // 1.3. Tạo Modal Đối chiếu nếu chưa có
        if (!document.getElementById('modalDoiChieuTkbSdb')) {
            const modalHTML = `
            <div id="modalDoiChieuTkbSdb" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] font-sans reactbits-fade-in p-2 md:p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-[1320px] h-[90vh] flex flex-col overflow-hidden border border-slate-300">
                    <!-- HEADER -->
                    <div class="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white px-4 py-3 flex justify-between items-center border-b shadow-md flex-none">
                        <div class="flex items-center gap-2.5">
                            <div class="p-1.5 bg-white/15 rounded-lg">
                                <svg class="w-6 h-6 text-emerald-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-base md:text-lg font-extrabold uppercase tracking-wide leading-tight">Trung tâm Đối chiếu & Khắc phục Chênh lệch TKB - Sổ Đầu Bài</h3>
                                <p class="text-[11px] text-teal-100 font-medium">Quét 6 trục tọa độ trên RAM (0ms) • Phát hiện chính xác nguyên nhân & Hỗ trợ đồng bộ tức thì</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="xuatExcelBaoCaoDoiChieu()" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow flex items-center gap-1.5 transition cursor-pointer" title="Xuất danh sách chênh lệch ra file Excel">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                <span>Xuất Excel</span>
                            </button>
                            <button onclick="dongModalDoiChieuTkbSdb()" class="text-white hover:text-red-200 text-3xl leading-none px-2 transition-colors cursor-pointer" title="Đóng">&times;</button>
                        </div>
                    </div>

                    <!-- BỘ LỌC & THỐNG KÊ NHANH -->
                    <div class="bg-slate-100 p-3 border-b border-slate-300 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 flex-none">
                        <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                            <div class="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-xs">
                                <span class="text-xs font-bold text-slate-600">Tuần:</span>
                                <select id="locTuanDoiChieu" onchange="thucThiQuetDoiChieuTrenRAM()" class="text-xs font-extrabold text-teal-900 bg-transparent outline-none cursor-pointer">
                                    <option value="ALL">Tất cả các tuần</option>
                                </select>
                            </div>

                            <div class="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-xs">
                                <span class="text-xs font-bold text-slate-600">Lớp:</span>
                                <select id="locLopDoiChieu" onchange="ketXuatBangDoiChieu()" class="text-xs font-extrabold text-blue-900 bg-transparent outline-none cursor-pointer">
                                    <option value="ALL">Toàn trường</option>
                                </select>
                            </div>

                            <div class="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-xs">
                                <span class="text-xs font-bold text-slate-600">Loại lệch:</span>
                                <select id="locLoaiLoiDoiChieu" onchange="ketXuatBangDoiChieu()" class="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer">
                                    <option value="ALL">Tất cả chênh lệch</option>
                                    <option value="LECH_MON">1. Lệch Môn học (Đổi môn)</option>
                                    <option value="THIEU_TRONG_SDB">2. Có trên TKB nhưng SĐB trống</option>
                                    <option value="DU_TRONG_SDB">3. Có trong SĐB nhưng TKB trống</option>
                                    <option value="LECH_GV">4. Lệch Giáo viên / Chữ ký cũ</option>
                                    <option value="LECH_PPCT">5. Sai lệch Tiết PPCT / Tên bài</option>
                                    <option value="CHUA_LUU_SDB">6. Lớp chưa lưu Sổ đầu bài tuần</option>
                                </select>
                            </div>

                            <div class="relative flex-1 min-w-[180px]">
                                <input type="text" id="timKiemDoiChieu" oninput="ketXuatBangDoiChieu()" placeholder="Tìm môn, tên GV, bài dạy..." class="w-full pl-7 pr-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500">
                                <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                        </div>

                        <!-- Thẻ tóm tắt số liệu -->
                        <div id="vungThongKeNhanhDoiChieu" class="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end"></div>
                    </div>

                    <!-- BẢNG KẾT QUẢ CHI TIẾT -->
                    <div class="flex-1 overflow-auto bg-slate-50 p-3 custom-scrollbar">
                        <table class="w-full border-collapse bg-white shadow-xs rounded-lg overflow-hidden text-xs" style="font-family: 'Times New Roman', Times, serif;">
                            <thead class="bg-slate-200 text-slate-900 font-bold sticky top-0 z-20 shadow-xs text-[13px]">
                                <tr>
                                    <th class="border border-slate-300 p-2 w-10 text-center">STT</th>
                                    <th class="border border-slate-300 p-2 w-28 text-center">Tọa độ Tiết</th>
                                    <th class="border border-slate-300 p-2 w-44 text-center">Loại chênh lệch & Mức độ</th>
                                    <th class="border border-slate-300 p-2 min-w-[180px]">Trên Thời khóa biểu (Chuẩn)</th>
                                    <th class="border border-slate-300 p-2 min-w-[200px]">Trong Sổ đầu bài (Thực tế)</th>
                                    <th class="border border-slate-300 p-2 min-w-[220px]">Thông tin cần biết & Hướng khắc phục</th>
                                    <th class="border border-slate-300 p-2 w-40 text-center">Thao tác khắc phục</th>
                                </tr>
                            </thead>
                            <tbody id="tbodyKetQuaDoiChieu" class="divide-y divide-slate-200 text-[13.5px]">
                                <tr><td colspan="7" class="p-8 text-center text-slate-500 font-bold">Đang phân tích dữ liệu...</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- FOOTER -->
                    <div class="bg-slate-100 px-4 py-2.5 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-center gap-2 flex-none text-xs">
                        <div class="text-slate-600 font-medium">
                            💡 <b>Mẹo xử lý nhanh:</b> Bấm <b>"Khắc phục cả lớp"</b> để tự động đồng bộ Môn học, tính lại Tiết PPCT, gán Tên bài chuẩn và mở khóa ký tên cho GV mới.
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="thucThiQuetDoiChieuTrenRAM(true)" class="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-1.5 rounded-lg shadow transition cursor-pointer">
                                🔄 Quét làm mới (0ms)
                            </button>
                            <button onclick="dongModalDoiChieuTkbSdb()" class="bg-slate-600 hover:bg-slate-700 text-white font-bold px-5 py-1.5 rounded-lg shadow transition cursor-pointer">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    // -------------------------------------------------------------------------
    // 2. HÀM CHUẨN HÓA DỮ LIỆU ĐỂ ĐỐI SÁNH CHÍNH XÁC 100%
    // -------------------------------------------------------------------------
    function chuanHoaChuoi(str) {
        if (!str) return '';
        return String(str).trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
    }

    function chuanHoaThu(thuStr) {
        if (!thuStr) return '';
        let s = String(thuStr).trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
        if (s.match(/^[2-7]$/)) return 'Thứ ' + s;
        if (s === 'cn' || s === 'chủ nhật' || s === 'chu nhat') return 'Chủ nhật';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function chuanHoaBuoi(buoiStr) {
        let s = chuanHoaChuoi(buoiStr);
        return (s === 'sáng' || s === 'sang' || s === 's') ? 'sáng' : 'chiều';
    }

    function layHoTenGV(maGV) {
        if (!maGV) return '';
        if (typeof window.layHoTenDayDuGiaoVienSDB === 'function') {
            return String(maGV).split(/[,;&-]/).map(m => window.layHoTenDayDuGiaoVienSDB(m.trim()) || m.trim()).filter(Boolean).join(', ');
        }
        return String(maGV).trim();
    }

    // -------------------------------------------------------------------------
    // 3. ĐỘNG CƠ ĐỐI CHIẾU 6 TRỤC TRÊN RAM (KHÔNG GỌI API NẶNG)
    // -------------------------------------------------------------------------
    window.moModalDoiChieuTkbSdb = async function(nguonMo) {
        khoiTaoGiaoDienDoiChieu();
        const modal = document.getElementById('modalDoiChieuTkbSdb');
        if (modal) modal.classList.remove('hidden');

        // Nếu dữ liệu Sổ đầu bài chưa được nạp vào RAM lần nào, kích hoạt nạp từ Cache/Server
        const coDuLieuSdbRAM = (typeof duLieuTKBGopDaMap !== 'undefined' && Array.isArray(duLieuTKBGopDaMap) && duLieuTKBGopDaMap.length > 0);
        if (!coDuLieuSdbRAM && typeof taiDuLieuSoDauBaiTuMayChu === 'function') {
            const tbody = document.getElementById('tbodyKetQuaDoiChieu');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="7" class="p-10 text-center text-teal-700 font-bold">
                    <div class="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-2"></div>
                    Đang đồng bộ kho dữ liệu Sổ đầu bài lần đầu...
                </td></tr>`;
            }
            await taiDuLieuSoDauBaiTuMayChu();
        }

        napBoLocTuanVaLop(nguonMo);
        thucThiQuetDoiChieuTrenRAM();
    };

    window.dongModalDoiChieuTkbSdb = function() {
        const modal = document.getElementById('modalDoiChieuTkbSdb');
        if (modal) modal.classList.add('hidden');
    };

    function napBoLocTuanVaLop(nguonMo) {
        let tapTuan = new Set();
        let tapLop = new Set();

        // Thu thập tuần & lớp từ mapTkbToanTap và duLieuTKBGopDaMap
        const mapTkb = window.mapTkbToanTap || (typeof mapTkbToanTapToanCuc !== 'undefined' ? mapTkbToanTapToanCuc : {});
        Object.values(mapTkb).forEach(d => {
            let t = parseInt(String(d['Tuần'] || '').replace(/\D/g, ''), 10);
            let l = String(d['Mã Lớp'] || '').trim().toUpperCase();
            if (t > 0) tapTuan.add(t);
            if (l) tapLop.add(l);
        });

        if (typeof duLieuTKBGopDaMap !== 'undefined' && Array.isArray(duLieuTKBGopDaMap)) {
            duLieuTKBGopDaMap.forEach(d => {
                let t = parseInt(String(d['Tuần'] || '').replace(/\D/g, ''), 10);
                let l = String(d['Mã Lớp'] || '').trim().toUpperCase();
                if (t > 0) tapTuan.add(t);
                if (l) tapLop.add(l);
            });
        }

        // Bổ sung tuần hiện tại đang xem trên lưới TKB (nếu có)
        if (typeof tuanDangXem !== 'undefined' && parseInt(tuanDangXem, 10) > 0) {
            tapTuan.add(parseInt(tuanDangXem, 10));
        }

        danhSachTuanCoDuLieu = Array.from(tapTuan).sort((a, b) => b - a);
        danhSachLopCoDuLieu = Array.from(tapLop).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        const selTuan = document.getElementById('locTuanDoiChieu');
        const selLop = document.getElementById('locLopDoiChieu');

        // Xác định tuần mặc định theo ngữ cảnh người dùng đang đứng
        let tuanMacDinh = 'ALL';
        if (nguonMo === 'SDB') {
            let tSdb = document.getElementById('chonTuanSo')?.value;
            if (tSdb) tuanMacDinh = String(parseInt(String(tSdb).replace(/\D/g, ''), 10));
        } else if (nguonMo === 'TKB') {
            if (typeof tuanDangXem !== 'undefined' && tuanDangXem) tuanMacDinh = String(tuanDangXem);
        }

        if (selTuan) {
            let htmlTuan = `<option value="ALL">Tất cả các tuần (${danhSachTuanCoDuLieu.length} tuần)</option>`;
            danhSachTuanCoDuLieu.forEach(t => {
                let isKhoaSDB = (typeof window.kiemTraTuanDaKhoa === 'function' && window.kiemTraTuanDaKhoa(t));
                htmlTuan += `<option value="${t}">Tuần ${t} ${isKhoaSDB ? '🔒' : ''}</option>`;
            });
            selTuan.innerHTML = htmlTuan;
            if (tuanMacDinh !== 'ALL' && danhSachTuanCoDuLieu.includes(parseInt(tuanMacDinh, 10))) {
                selTuan.value = tuanMacDinh;
            }
        }

        if (selLop) {
            let lopMacDinh = 'ALL';
            if (nguonMo === 'SDB') {
                let lSdb = document.getElementById('chonLopSo')?.value;
                if (lSdb) lopMacDinh = String(lSdb).trim().toUpperCase();
            }
            let htmlLop = `<option value="ALL">Toàn trường (${danhSachLopCoDuLieu.length} lớp)</option>`;
            danhSachLopCoDuLieu.forEach(l => {
                htmlLop += `<option value="${l}">Lớp ${l}</option>`;
            });
            selLop.innerHTML = htmlLop;
            if (lopMacDinh !== 'ALL' && danhSachLopCoDuLieu.includes(lopMacDinh)) {
                selLop.value = lopMacDinh;
            }
        }
    }

    // -------------------------------------------------------------------------
    // 4. THUẬT TOÁN QUÉT CHÊNH LỆCH TOÀN DIỆN (6 LOẠI SAI LỆCH)
    // -------------------------------------------------------------------------
    window.thucThiQuetDoiChieuTrenRAM = function() {
        ketQuaDoiChieuToanCuc = [];

        const selTuan = document.getElementById('locTuanDoiChieu');
        const tuanLoc = selTuan ? selTuan.value : 'ALL';
        const dsTuanQuet = (tuanLoc === 'ALL') ? danhSachTuanCoDuLieu : [parseInt(tuanLoc, 10)];

        // Hợp nhất nguồn TKB chuẩn: từ mapTkbToanTap VÀ dữ liệu trực tiếp trên lưới TKB hiện tại (duLieuTkbHienTai)
        const mapTkbChuan = Object.assign({}, window.mapTkbToanTap || (typeof mapTkbToanTapToanCuc !== 'undefined' ? mapTkbToanTapToanCuc : {}));
        if (typeof duLieuTkbHienTai !== 'undefined' && Array.isArray(duLieuTkbHienTai)) {
            duLieuTkbHienTai.forEach(item => {
                let t = parseInt(String(item.tuan || '').replace(/\D/g, ''), 10);
                let lop = String(item.maLop || '').trim().toUpperCase();
                let thu = chuanHoaThu(item.thu);
                let buoi = chuanHoaBuoi(item.buoi);
                let tiet = String(item.tiet || '').trim();
                if (t > 0 && lop && thu && tiet) {
                    let k = `${t}_${lop}_${thu}_${buoi}_${tiet}`;
                    mapTkbChuan[k] = {
                        'Tuần': t,
                        'Mã Lớp': lop,
                        'Thứ': thu,
                        'Buổi': buoi,
                        'Tiết': tiet,
                        'Môn Học': item.monHoc || '',
                        'Mã GV': item.maGv || '',
                        'Ngày': item.ngay || ''
                    };
                }
            });
        }

        // Lập chỉ mục dữ liệu Sổ đầu bài theo khóa 5 trục: tuan_lop_thu_buoi_tiet
        const mapSdbThucTe = {};
        const thongKeLuuTheoTuanLop = {}; // { "tuan_lop": { soTietCoMonTKB: 0, soTietDaLuuSDB: 0 } }

        if (typeof duLieuTKBGopDaMap !== 'undefined' && Array.isArray(duLieuTKBGopDaMap)) {
            duLieuTKBGopDaMap.forEach(d => {
                let t = parseInt(String(d['Tuần'] || '').replace(/\D/g, ''), 10);
                let lop = String(d['Mã Lớp'] || '').trim().toUpperCase();
                let thu = chuanHoaThu(d['Thứ']);
                let buoi = chuanHoaBuoi(d['Buổi']);
                let tiet = String(d['Tiết'] || '').trim();
                if (!t || !lop) return;

                let k = `${t}_${lop}_${thu}_${buoi}_${tiet}`;
                mapSdbThucTe[k] = d;

                let kTL = `${t}_${lop}`;
                if (!thongKeLuuTheoTuanLop[kTL]) thongKeLuuTheoTuanLop[kTL] = { tuan: t, lop: lop, coMonTKB: 0, daLuuSDB: 0 };
                if (d.DaLuu === true && String(d['Môn Học'] || '').trim() !== '') {
                    thongKeLuuTheoTuanLop[kTL].daLuuSDB++;
                }
            });
        }

        Object.values(mapTkbChuan).forEach(tkb => {
            let t = parseInt(String(tkb['Tuần'] || '').replace(/\D/g, ''), 10);
            let lop = String(tkb['Mã Lớp'] || '').trim().toUpperCase();
            if (!t || !lop) return;
            let kTL = `${t}_${lop}`;
            if (!thongKeLuuTheoTuanLop[kTL]) thongKeLuuTheoTuanLop[kTL] = { tuan: t, lop: lop, coMonTKB: 0, daLuuSDB: 0 };
            if (String(tkb['Môn Học'] || '').trim() !== '') {
                thongKeLuuTheoTuanLop[kTL].coMonTKB++;
            }
        });

        const thuTuThu = { "Thứ 2": 2, "Thứ 3": 3, "Thứ 4": 4, "Thứ 5": 5, "Thứ 6": 6, "Thứ 7": 7, "Chủ nhật": 8 };
        const thuTuBuoi = { "sáng": 1, "chiều": 2 };

        // Quét từng Tuần và từng Lớp
        dsTuanQuet.forEach(tuan => {
            danhSachLopCoDuLieu.forEach(lop => {
                let kTL = `${tuan}_${lop}`;
                let tk = thongKeLuuTheoTuanLop[kTL];
                if (!tk) return;

                let matchKhoi = lop.match(/\d+/);
                let khoi = matchKhoi ? matchKhoi[0] : '';

                // TRƯỜNG HỢP 6: Có TKB nhưng cả lớp chưa lưu Sổ đầu bài tuần này
                if (tk.coMonTKB > 0 && tk.daLuuSDB === 0) {
                    ketQuaDoiChieuToanCuc.push({
                        tuan: tuan,
                        lop: lop,
                        thu: 'Cả tuần',
                        buoi: '--',
                        tiet: '--',
                        ngay: '',
                        loaiLoi: 'CHUA_LUU_SDB',
                        tenLoaiLoi: 'Chưa khởi tạo / lưu SĐB',
                        mucDo: 'TRUNG_BINH',
                        tkbMon: `${tk.coMonTKB} tiết trên TKB`,
                        tkbGV: 'Theo phân công TKB',
                        sdbMon: 'Chưa lưu vào sheet SoDauBai',
                        sdbGV: 'Chưa ký',
                        sdbTietPPCT: '--',
                        sdbTenBai: '--',
                        nguyenNhan: `Lớp ${lop} (Tuần ${tuan}) đã có TKB (${tk.coMonTKB} tiết) nhưng chưa bấm "Lưu Sổ đầu bài" lần nào.`,
                        huongKhacPhuc: `Mở Sổ đầu bài Lớp ${lop} - Tuần ${tuan}, bấm "Đồng bộ Tên bài" và "Lưu Sổ đầu bài" để khởi tạo dữ liệu tuần.`,
                        coDuLieuKyCu: false
                    });
                    return; // Bỏ qua quét từng tiết lẻ vì cả tuần chưa lưu
                }

                // Nếu lớp đã lưu Sổ đầu bài tuần này -> Quét chi tiết từng slot tiết học
                let tapKhoaSlot = new Set();
                Object.keys(mapTkbChuan).forEach(k => { if (k.startsWith(`${tuan}_${lop}_`)) tapKhoaSlot.add(k); });
                Object.keys(mapSdbThucTe).forEach(k => { if (k.startsWith(`${tuan}_${lop}_`)) tapKhoaSlot.add(k); });

                let dsKhoaSorted = Array.from(tapKhoaSlot).sort((a, b) => {
                    let pA = a.split('_'), pB = b.split('_');
                    let tA = thuTuThu[pA[2]] || 99, tB = thuTuThu[pB[2]] || 99;
                    if (tA !== tB) return tA - tB;
                    let bA = thuTuBuoi[pA[3]] || 99, bB = thuTuBuoi[pB[3]] || 99;
                    if (bA !== bB) return bA - bB;
                    return (parseInt(pA[4], 10) || 0) - (parseInt(pB[4], 10) || 0);
                });

                // Tính mốc Tiết PPCT tích lũy của các tuần trước tuần đang xét cho lớp này
                let boDemPPCT = {};
                if (typeof duLieuTKBGopDaMap !== 'undefined') {
                    duLieuTKBGopDaMap.forEach(d => {
                        let tTruoc = parseInt(String(d['Tuần'] || '').replace(/\D/g, ''), 10) || 0;
                        let lTruoc = String(d['Mã Lớp'] || '').trim().toUpperCase();
                        if (lTruoc === lop && tTruoc < tuan && d.DaLuu === true) {
                            let m = String(d['Môn Học'] || '').trim();
                            if (m !== '') {
                                let mNorm = m.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
                                let tietLuu = parseInt(String(d['TietPPCT_Thuc'] || '').replace(/\D/g, ''), 10) || 0;
                                if (tietLuu > 0) boDemPPCT[mNorm] = Math.max(boDemPPCT[mNorm] || 0, tietLuu);
                                else boDemPPCT[mNorm] = (boDemPPCT[mNorm] || 0) + 1;
                            }
                        }
                    });
                }

                let demMonTrongTuanTKB = {};

                dsKhoaSorted.forEach(khoa => {
                    let parts = khoa.split('_');
                    let thu = parts[2];
                    let buoi = parts[3] === 'sáng' ? 'Sáng' : 'Chiều';
                    let tiet = parts[4];

                    let tkbItem = mapTkbChuan[khoa];
                    let sdbItem = mapSdbThucTe[khoa];

                    let monTKB = tkbItem ? String(tkbItem['Môn Học'] || '').trim() : '';
                    let gvTKB = tkbItem ? String(tkbItem['Mã GV'] || '').trim() : '';
                    let ngayTiet = (tkbItem && tkbItem['Ngày']) ? tkbItem['Ngày'] : (sdbItem ? (sdbItem['Ngày'] || '') : '');

                    let monSDB = (sdbItem && (sdbItem.DaLuu === true || sdbItem.DaDongBoTKB === true)) ? String(sdbItem['Môn Học'] || '').trim() : '';
                    let gvSDB = sdbItem ? String(sdbItem['Mã GV'] || '').trim() : '';
                    let chuKySDB = sdbItem ? String(sdbItem['ChuKy_Thuc'] || '').trim() : '';
                    let nhanXetSDB = sdbItem ? String(sdbItem['NhanXet_Thuc'] || '').trim() : '';
                    let xepLoaiSDB = sdbItem ? String(sdbItem['XepLoai_Thuc'] || '').trim() : '';
                    let tietPpctSDB = sdbItem ? String(sdbItem['TietPPCT_Thuc'] || '').trim() : '';
                    let tenBaiSDB = sdbItem ? String(sdbItem['TenBai_Thuc'] || '').trim() : '';

                    // Tính tiết PPCT kỳ vọng theo TKB
                    let tietPpctKyVong = '';
                    let tenBaiKyVong = '';
                    if (monTKB !== '') {
                        let mNorm = monTKB.replace(/[0-9\(\)]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
                        demMonTrongTuanTKB[mNorm] = (demMonTrongTuanTKB[mNorm] || 0) + 1;
                        tietPpctKyVong = String((boDemPPCT[mNorm] || 0) + demMonTrongTuanTKB[mNorm]);
                        if (typeof window.timTenBaiChuanSDB === 'function') {
                            tenBaiKyVong = window.timTenBaiChuanSDB(khoi, monTKB, tietPpctKyVong) || '';
                        }
                    }

                    let coKyCu = (chuKySDB !== '' || nhanXetSDB !== '' || xepLoaiSDB !== '');

                    // PHÂN LOẠI 1, 2, 3: LỆCH MÔN HỌC / THIẾU TIẾT / DƯ TIẾT
                    if (chuanHoaChuoi(monTKB) !== chuanHoaChuoi(monSDB)) {
                        let loai = 'LECH_MON';
                        let tenLoai = 'Lệch Môn học';
                        let nguyenNhan = '';
                        let huongXuLy = '';

                        if (monTKB && monSDB) {
                            loai = 'LECH_MON';
                            tenLoai = 'Đổi Môn học trên TKB';
                            nguyenNhan = `TKB đã đổi từ môn [${monSDB}] sang môn [${monTKB}] (GV: ${layHoTenGV(gvTKB) || gvTKB}), nhưng Sổ đầu bài vẫn lưu môn cũ [${monSDB}].`;
                            huongXuLy = `Cập nhật sang môn [${monTKB}], gán Tiết PPCT số ${tietPpctKyVong}${tenBaiKyVong ? ` ("${tenBaiKyVong}")` : ''} và cấp quyền ký cho ${layHoTenGV(gvTKB) || 'GV mới'}.` +
                                         (coKyCu ? ` ⚠️ Lưu ý: Tiết này đã có chữ ký của [${chuKySDB}], khi đồng bộ sẽ xóa chữ ký cũ.` : '');
                        } else if (monTKB && !monSDB) {
                            loai = 'THIEU_TRONG_SDB';
                            tenLoai = 'Thiếu tiết trong SĐB';
                            nguyenNhan = `Trên TKB xếp môn [${monTKB}] (GV: ${layHoTenGV(gvTKB) || gvTKB}) nhưng trong Sổ đầu bài đang bị trống.`;
                            huongXuLy = `Bổ sung môn [${monTKB}] (Tiết PPCT ${tietPpctKyVong}) vào Sổ đầu bài để GV ${layHoTenGV(gvTKB) || gvTKB} nhận xét và ký tên.`;
                        } else if (!monTKB && monSDB) {
                            loai = 'DU_TRONG_SDB';
                            tenLoai = 'Dư tiết trong SĐB (TKB trống)';
                            nguyenNhan = `Trên TKB tiết này đã chuyển sang Nghỉ/Trống, nhưng Sổ đầu bài vẫn còn lưu môn [${monSDB}].`;
                            huongXuLy = `Xóa tiết [${monSDB}] khỏi vị trí này trong SĐB và tự động dồn lại thứ tự Tiết PPCT của môn [${monSDB}] trong tuần.`;
                        }

                        ketQuaDoiChieuToanCuc.push({
                            khoa: khoa,
                            tuan: tuan,
                            lop: lop,
                            thu: thu,
                            buoi: buoi,
                            tiet: tiet,
                            ngay: ngayTiet,
                            loaiLoi: loai,
                            tenLoaiLoi: tenLoai,
                            mucDo: 'CAO',
                            tkbMon: monTKB || '(Trống / Nghỉ)',
                            tkbGV: layHoTenGV(gvTKB) || gvTKB || '--',
                            tkbMaGV: gvTKB,
                            tkbTietPPCT: tietPpctKyVong,
                            tkbTenBai: tenBaiKyVong,
                            sdbMon: monSDB || '(Trống)',
                            sdbGV: chuKySDB ? `Đã ký: ${chuKySDB}` : (layHoTenGV(gvSDB) || 'Chưa ký'),
                            sdbTietPPCT: tietPpctSDB || '--',
                            sdbTenBai: tenBaiSDB || '--',
                            nguyenNhan: nguyenNhan,
                            huongKhacPhuc: huongXuLy,
                            coDuLieuKyCu: coKyCu
                        });
                        return;
                    }

                    // PHÂN LOẠI 4: CÙNG MÔN HỌC NHƯNG ĐỔI GIÁO VIÊN DẠY TRÊN TKB
                    if (monTKB !== '' && gvTKB !== '') {
                        let dsMaGvTKB = gvTKB.split(/[,;&-]/).map(g => g.trim()).filter(Boolean);
                        let tapTenVaMaGvMoi = [];
                        dsMaGvTKB.forEach(m => {
                            tapTenVaMaGvMoi.push(chuanHoaChuoi(m));
                            let tenDayDu = layHoTenGV(m);
                            if (tenDayDu) tapTenVaMaGvMoi.push(chuanHoaChuoi(tenDayDu));
                        });

                        let chuKyNorm = chuanHoaChuoi(chuKySDB);
                        let khacMaGv = (gvSDB !== '' && chuanHoaChuoi(gvSDB) !== chuanHoaChuoi(gvTKB));
                        let daKyBoiNguoiCu = (chuKyNorm !== '' && !tapTenVaMaGvMoi.some(g => g === chuKyNorm || (g.length > 2 && chuKyNorm.includes(g))));

                        if (khacMaGv || daKyBoiNguoiCu) {
                            let tenGvCu = chuKySDB || layHoTenGV(gvSDB) || gvSDB || 'Chưa rõ';
                            let tenGvMoi = layHoTenGV(gvTKB) || gvTKB;
                            ketQuaDoiChieuToanCuc.push({
                                khoa: khoa,
                                tuan: tuan,
                                lop: lop,
                                thu: thu,
                                buoi: buoi,
                                tiet: tiet,
                                ngay: ngayTiet,
                                loaiLoi: 'LECH_GV',
                                tenLoaiLoi: 'Đổi Giáo viên phụ trách',
                                mucDo: daKyBoiNguoiCu ? 'CAO' : 'TRUNG_BINH',
                                tkbMon: monTKB,
                                tkbGV: tenGvMoi,
                                tkbMaGV: gvTKB,
                                tkbTietPPCT: tietPpctKyVong,
                                tkbTenBai: tenBaiKyVong,
                                sdbMon: monSDB,
                                sdbGV: chuKySDB ? `Đã ký: ${chuKySDB}` : `Phân công cũ: ${tenGvCu}`,
                                sdbTietPPCT: tietPpctSDB || '--',
                                sdbTenBai: tenBaiSDB || '--',
                                nguyenNhan: daKyBoiNguoiCu
                                    ? `Môn [${monTKB}] trên TKB đã đổi sang GV [${tenGvMoi}], nhưng trong SĐB vẫn còn chữ ký của GV cũ [${chuKySDB}].`
                                    : `Môn [${monTKB}] đã thay đổi phân công GV trên TKB từ [${tenGvCu}] sang [${tenGvMoi}].`,
                                huongKhacPhuc: `Đồng bộ lại phân công GV sang [${tenGvMoi}] để mở quyền ký tên cho GV mới` + (daKyBoiNguoiCu ? ` và làm sạch chữ ký cũ của [${chuKySDB}].` : '.'),
                                coDuLieuKyCu: coKyCu
                            });
                            return;
                        }
                    }

                    // PHÂN LOẠI 5: KHỚP MÔN & GV NHƯNG LỆCH TIẾT PPCT HOẶC TRỐNG TÊN BÀI DẠY
                    if (monTKB !== '' && monSDB !== '') {
                        let lechSoTietPPCT = (tietPpctKyVong !== '' && tietPpctSDB !== '' && String(tietPpctKyVong) !== String(tietPpctSDB));
                        let thieuTenBai = (tenBaiSDB === '' && tenBaiKyVong !== '');

                        if (lechSoTietPPCT || thieuTenBai) {
                            ketQuaDoiChieuToanCuc.push({
                                khoa: khoa,
                                tuan: tuan,
                                lop: lop,
                                thu: thu,
                                buoi: buoi,
                                tiet: tiet,
                                ngay: ngayTiet,
                                loaiLoi: 'LECH_PPCT',
                                tenLoaiLoi: lechSoTietPPCT ? 'Lệch thứ tự Tiết PPCT' : 'Thiếu Tên bài dạy',
                                mucDo: 'THAP',
                                tkbMon: monTKB,
                                tkbGV: layHoTenGV(gvTKB) || gvTKB,
                                tkbMaGV: gvTKB,
                                tkbTietPPCT: tietPpctKyVong,
                                tkbTenBai: tenBaiKyVong,
                                sdbMon: monSDB,
                                sdbGV: chuKySDB ? `Đã ký: ${chuKySDB}` : (layHoTenGV(gvSDB) || 'Chưa ký'),
                                sdbTietPPCT: tietPpctSDB || '(Trống)',
                                sdbTenBai: tenBaiSDB || '(Trống tên bài)',
                                nguyenNhan: lechSoTietPPCT
                                    ? `Theo tiến độ tích lũy, tiết này là Tiết PPCT ${tietPpctKyVong}, nhưng SĐB đang ghi Tiết PPCT ${tietPpctSDB}.`
                                    : `Tiết ${tietPpctSDB || tietPpctKyVong} môn [${monSDB}] chưa được điền Tên bài dạy từ PPCT.`,
                                huongKhacPhuc: `Cập nhật lại Tiết PPCT = ${tietPpctKyVong} và điền chuẩn tên bài: "${tenBaiKyVong || 'Theo PPCT'}".`,
                                coDuLieuKyCu: coKyCu
                            });
                        }
                    }
                });
            });
        });

        ketXuatBangDoiChieu();
    };

    // -------------------------------------------------------------------------
    // 5. KẾT XUẤT BẢNG BÁO CÁO & THỐNG KÊ TRỰC QUAN
    // -------------------------------------------------------------------------
    window.ketXuatBangDoiChieu = function() {
        const tbody = document.getElementById('tbodyKetQuaDoiChieu');
        const vungThongKe = document.getElementById('vungThongKeNhanhDoiChieu');
        if (!tbody) return;

        const lopLoc = document.getElementById('locLopDoiChieu')?.value || 'ALL';
        const loaiLoc = document.getElementById('locLoaiLoiDoiChieu')?.value || 'ALL';
        const tuKhoa = chuanHoaChuoi(document.getElementById('timKiemDoiChieu')?.value || '');

        let dsHienThi = ketQuaDoiChieuToanCuc.filter(item => {
            if (lopLoc !== 'ALL' && item.lop !== lopLoc) return false;
            if (loaiLoc !== 'ALL' && item.loaiLoi !== loaiLoc) return false;
            if (tuKhoa !== '') {
                let chuoiTim = chuanHoaChuoi(`${item.lop} ${item.thu} ${item.tkbMon} ${item.sdbMon} ${item.tkbGV} ${item.sdbGV} ${item.nguyenNhan}`);
                if (!chuoiTim.includes(tuKhoa)) return false;
            }
            return true;
        });

        // Thống kê nhanh theo mức độ
        let demCao = dsHienThi.filter(x => x.mucDo === 'CAO').length;
        let demTB = dsHienThi.filter(x => x.mucDo === 'TRUNG_BINH').length;
        let demThap = dsHienThi.filter(x => x.mucDo === 'THAP').length;

        if (vungThongKe) {
            vungThongKe.innerHTML = `
                <span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-200 text-slate-800 border border-slate-300">
                    Tổng phát hiện: ${dsHienThi.length}
                </span>
                <span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300" title="Lệch môn, thiếu/dư tiết hoặc đã ký bởi GV cũ">
                    🔴 Nghiêm trọng: ${demCao}
                </span>
                <span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300" title="Đổi GV chưa ký hoặc lớp chưa lưu SĐB">
                    🟠 Cần đồng bộ: ${demTB}
                </span>
                <span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300" title="Lệch số tiết PPCT hoặc thiếu tên bài">
                    🔵 Tiến độ PPCT: ${demThap}
                </span>
            `;
        }

        if (dsHienThi.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-12 text-center">
                        <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p class="text-base font-extrabold text-emerald-800 uppercase tracking-wide">Tuyệt vời! Thời khóa biểu và Sổ đầu bài hoàn toàn khớp nhau</p>
                        <p class="text-xs text-slate-500 mt-1">Không phát hiện bất kỳ sự chênh lệch nào trong phạm vi bộ lọc hiện tại.</p>
                    </td>
                </tr>`;
            return;
        }

        let htmlRows = '';
        dsHienThi.forEach((item, idx) => {
            let badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
            if (item.mucDo === 'CAO') badgeClass = 'bg-red-100 text-red-800 border-red-300';
            else if (item.mucDo === 'TRUNG_BINH') badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';

            let canhBaoKyCu = item.coDuLieuKyCu
                ? `<div class="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold">
                       ⚠️ Đã có dữ liệu/chữ ký cũ
                   </div>`
                : '';

            htmlRows += `
                <tr class="hover:bg-teal-50/40 transition-colors">
                    <td class="border border-slate-300 p-2 text-center font-bold text-slate-600">${idx + 1}</td>
                    <td class="border border-slate-300 p-2 text-center">
                        <div class="font-extrabold text-blue-900 text-sm">Lớp ${item.lop} • Tuần ${item.tuan}</div>
                        <div class="text-xs font-bold text-slate-700">${item.thu} ${item.buoi !== '--' ? `(${item.buoi} - T${item.tiet})` : ''}</div>
                        ${item.ngay ? `<div class="text-[11px] text-slate-500 italic">${item.ngay}</div>` : ''}
                    </td>
                    <td class="border border-slate-300 p-2 text-center align-middle">
                        <span class="inline-block px-2 py-1 rounded border font-extrabold text-xs ${badgeClass}">
                            ${item.tenLoaiLoi}
                        </span>
                        ${canhBaoKyCu}
                    </td>
                    <td class="border border-slate-300 p-2 align-top bg-emerald-50/30">
                        <div class="font-extrabold text-emerald-900">${item.tkbMon}</div>
                        <div class="text-xs text-slate-700 mt-0.5"><b>GV TKB:</b> ${item.tkbGV}</div>
                        ${item.tkbTietPPCT ? `<div class="text-xs text-teal-800 mt-0.5"><b>PPCT chuẩn:</b> Tiết ${item.tkbTietPPCT} ${item.tkbTenBai ? `- <i>${item.tkbTenBai}</i>` : ''}</div>` : ''}
                    </td>
                    <td class="border border-slate-300 p-2 align-top bg-rose-50/30">
                        <div class="font-extrabold text-rose-900">${item.sdbMon}</div>
                        <div class="text-xs text-slate-700 mt-0.5"><b>Trạng thái ký:</b> ${item.sdbGV}</div>
                        ${item.sdbTietPPCT && item.sdbTietPPCT !== '--' ? `<div class="text-xs text-slate-600 mt-0.5"><b>PPCT đang lưu:</b> Tiết ${item.sdbTietPPCT} (${item.sdbTenBai})</div>` : ''}
                    </td>
                    <td class="border border-slate-300 p-2 align-top">
                        <div class="text-slate-800 font-semibold leading-snug">${item.nguyenNhan}</div>
                        <div class="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded p-1.5 mt-1 leading-snug">
                            <b>Khắc phục:</b> ${item.huongKhacPhuc}
                        </div>
                    </td>
                    <td class="border border-slate-300 p-2 text-center align-middle">
                        <div class="flex flex-col gap-1.5">
                            <button onclick="dieuHuongVaKhacPhucNhanh(${item.tuan}, '${item.lop}', true)" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold px-2.5 py-1.5 rounded shadow-xs text-xs flex items-center justify-center gap-1 transition cursor-pointer" title="Mở Sổ đầu bài lớp ${item.lop} Tuần ${item.tuan} và chạy đồng bộ tự động">
                                ⚡ Khắc phục Lớp ${item.lop}
                            </button>
                            <button onclick="dieuHuongVaKhacPhucNhanh(${item.tuan}, '${item.lop}', false)" class="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2.5 py-1 rounded text-xs transition cursor-pointer" title="Mở xem Sổ đầu bài Lớp ${item.lop} Tuần ${item.tuan}">
                                👁️ Mở xem SĐB
                            </button>
                        </div>
                    </td>
                </tr>`;
        });

        tbody.innerHTML = htmlRows;
    };

    // -------------------------------------------------------------------------
    // 6. HÀM ĐIỀU HƯỚNG & TỰ ĐỘNG KHẮC PHỤC CHÊNH LỆCH
    // -------------------------------------------------------------------------
    window.dieuHuongVaKhacPhucNhanh = function(tuanMucTieu, lopMucTieu, tuDongChayDongBo) {
        dongModalDoiChieuTkbSdb();

        // Chuyển sang Tab Sổ đầu bài nếu đang ở Tab khác
        let khungSDB = document.getElementById('khungSoDauBai');
        if (khungSDB && khungSDB.classList.contains('hidden')) {
            if (typeof window.kichHoatTab === 'function') {
                window.kichHoatTab('menuSoDauBai', 'khungSoDauBai', false);
            }
        }

        setTimeout(() => {
            const selTuan = document.getElementById('chonTuanSo');
            const selLop = document.getElementById('chonLopSo');
            if (!selTuan || !selLop) return;

            // Chọn đúng Lớp và Tuần mục tiêu
            let optLop = Array.from(selLop.options).find(o => String(o.value).trim().toUpperCase() === String(lopMucTieu).trim().toUpperCase());
            if (optLop) selLop.value = optLop.value;

            let optTuan = Array.from(selTuan.options).find(o => parseInt(String(o.value).replace(/\D/g, ''), 10) === parseInt(tuanMucTieu, 10));
            if (optTuan) selTuan.value = optTuan.value;

            if (typeof window.dongBoHienThiTuSelect === 'function') {
                window.dongBoHienThiTuSelect('chonLopSo');
                window.dongBoHienThiTuSelect('chonTuanSo');
            }

            if (typeof ketXuatSoDauBaiLenLuoi === 'function') {
                ketXuatSoDauBaiLenLuoi();
            }

            // Nếu bấm "Khắc phục Lớp", tự động kích hoạt quy trình đồng bộ TKB vào SĐB hoặc Đồng bộ tên bài
            if (tuDongChayDongBo) {
                setTimeout(() => {
                    let dsLech = (typeof window.kiemTraKhacBietTkbVaSoDauBai === 'function')
                        ? window.kiemTraKhacBietTkbVaSoDauBai(selTuan.value, selLop.value)
                        : [];

                    if (dsLech && dsLech.length > 0 && typeof window.thucThiDongBoTkbVaoSoDauBai === 'function') {
                        window.thucThiDongBoTkbVaoSoDauBai();
                    } else if (typeof dongBoTenBaiHoc === 'function') {
                        dongBoTenBaiHoc();
                    }
                }, 180);
            }
        }, 100);
    };

    // -------------------------------------------------------------------------
    // 7. XUẤT BÁO CÁO CHÊNH LỆCH RA EXCEL (.XLSX)
    // -------------------------------------------------------------------------
    window.xuatExcelBaoCaoDoiChieu = function() {
        if (typeof XLSX === 'undefined') {
            return alert('Thư viện xuất Excel chưa sẵn sàng!');
        }
        if (!ketQuaDoiChieuToanCuc || ketQuaDoiChieuToanCuc.length === 0) {
            return alert('Không có dữ liệu chênh lệch nào để xuất!');
        }

        const rows = ketQuaDoiChieuToanCuc.map((item, idx) => ({
            'STT': idx + 1,
            'Tuần': item.tuan,
            'Lớp': item.lop,
            'Thứ': item.thu,
            'Buổi': item.buoi,
            'Tiết': item.tiet,
            'Ngày': item.ngay || '',
            'Loại chênh lệch': item.tenLoaiLoi,
            'Môn trên TKB': item.tkbMon,
            'GV trên TKB': item.tkbGV,
            'Môn trong SĐB': item.sdbMon,
            'Trạng thái SĐB': item.sdbGV,
            'Nguyên nhân chi tiết': item.nguyenNhan,
            'Hướng khắc phục': item.huongKhacPhuc
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DoiChieu_TKB_SDB');
        XLSX.writeFile(wb, `BaoCao_DoiChieu_TKB_SoDauBai_Tuan_${document.getElementById('locTuanDoiChieu')?.value || 'All'}.xlsx`);
    };

    // Khởi chạy gắn nút ngay khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(khoiTaoGiaoDienDoiChieu, 400));
    } else {
        setTimeout(khoiTaoGiaoDienDoiChieu, 400);
    }
})();
