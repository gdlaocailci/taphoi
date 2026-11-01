// =========================================================================
// PHÂN HỆ HỢP NHẤT TOÀN DIỆN: KIỂM TOÁN ĐỊNH MỨC MÔN, GỢI Ý ĐIỀN NHANH
// & SỔ CÁI ĐẨY TIẾT / THẾ TIẾT / BÙ - TRẢ TIẾT LIÊN TUẦN
// =========================================================================

window.trangThaiDacBietTKB = window.trangThaiDacBietTKB || {};

// -------------------------------------------------------------------------
// HÀM 1: Chuẩn hóa tên môn học (Chống lệch dấu cách & bảng mã Unicode)
// -------------------------------------------------------------------------
window.chuanHoaTenMonKCT = function(tenMon) {
    if (!tenMon) return '';
    return String(tenMon).normalize('NFC').trim().replace(/\s+/g, ' ');
};

// -------------------------------------------------------------------------
// HÀM 2: Khởi tạo & Lưu trữ cờ [ĐẨY TIẾT] / [THẾ TIẾT] (Alt + Click)
// -------------------------------------------------------------------------
window.khoiTaoCoDayTheTietTKB = function() {
    try {
        let key = (typeof window.layKhoaCachLy === 'function')
            ? window.layKhoaCachLy('SmartTKB_CoDayTheTiet_V2')
            : 'SmartTKB_CoDayTheTiet_V2';
        let raw = localStorage.getItem(key);
        if (raw) {
            window.trangThaiDacBietTKB = JSON.parse(raw) || {};
        }
    } catch (e) {
        console.warn("Không thể đọc cache cờ Đẩy/Thế tiết:", e);
    }
};
window.khoiTaoCoDayTheTietTKB();

window.luuCoDayTheTietTKB = function() {
    try {
        let key = (typeof window.layKhoaCachLy === 'function')
            ? window.layKhoaCachLy('SmartTKB_CoDayTheTiet_V2')
            : 'SmartTKB_CoDayTheTiet_V2';
        localStorage.setItem(key, JSON.stringify(window.trangThaiDacBietTKB));
    } catch (e) {}
};

window.chuyenDoiCheDoDayTheTiet = function(thu, buoi, tiet, lop) {
    if (typeof window.kiemTraTuanTkbDaKhoa === 'function' && window.kiemTraTuanTkbDaKhoa(tuanDangXem)) {
        alert(`⚠️ Thời khóa biểu Tuần ${tuanDangXem} đang bị KHÓA. Không thể thay đổi trạng thái tiết học!`);
        return;
    }
    let namHoc = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC) ? thongSoHocVu.NAM_HOC : 'NH';
    let maO = `${namHoc}_${tuanDangXem}_${thu}_${buoi}_${tiet}_${lop}`;
    let trangThaiHienTai = window.trangThaiDacBietTKB[maO] || '';

    if (trangThaiHienTai === '') {
        window.trangThaiDacBietTKB[maO] = 'DAY_TIET';
    } else if (trangThaiHienTai === 'DAY_TIET') {
        window.trangThaiDacBietTKB[maO] = 'THE_TIET';
    } else {
        delete window.trangThaiDacBietTKB[maO];
    }

    window.luuCoDayTheTietTKB();
    window.veNhanDayTheTietTrenO(thu, buoi, tiet, lop);
    window.capNhatCanhBaoChiTietMonTrenLuoi(lop);
};

window.veNhanDayTheTietTrenO = function(thu, buoi, tiet, lop) {
    let oMon = document.getElementById(`mon_${thu}_${buoi}_${tiet}_${lop}`);
    let oGv = document.getElementById(`gv_${thu}_${buoi}_${tiet}_${lop}`);
    if (!oMon) return;

    let tdMon = oMon.closest('td');
    let tdGv = oGv ? oGv.closest('td') : null;
    if (!tdMon) return;

    let namHoc = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC) ? thongSoHocVu.NAM_HOC : 'NH';
    let maO = `${namHoc}_${tuanDangXem}_${thu}_${buoi}_${tiet}_${lop}`;
    let co = window.trangThaiDacBietTKB[maO];

    let nhanMonCu = tdMon.querySelector('.badge-day-the');
    if (nhanMonCu) nhanMonCu.remove();
    if (tdGv) {
        let nhanGvCu = tdGv.querySelector('.badge-day-the');
        if (nhanGvCu) nhanGvCu.remove();
    }

    if (co === 'DAY_TIET') {
        tdMon.classList.add('relative');
        tdMon.insertAdjacentHTML(
            'beforeend',
            `<span class="badge-day-the absolute top-0.5 left-0.5 px-1 py-0 text-[9px] font-extrabold bg-blue-600 text-white rounded shadow pointer-events-none leading-tight" title="Tiết dạy đẩy tiến độ / dạy bù">ĐẨY</span>`
        );
    } else if (co === 'THE_TIET' && tdGv) {
        tdGv.classList.add('relative');
        tdGv.insertAdjacentHTML(
            'beforeend',
            `<span class="badge-day-the absolute top-0.5 left-0.5 px-1 py-0 text-[9px] font-extrabold bg-purple-600 text-white rounded shadow pointer-events-none leading-tight" title="Tiết dạy thế / dạy thay giáo viên">THẾ</span>`
        );
    }
};

// -------------------------------------------------------------------------
// HÀM 3: Sổ cái Lũy kế Liên tuần (Quét các tuần trước từ bộ nhớ sẵn có 0ms)
// -------------------------------------------------------------------------
window.tinhSoDuLuyKeCacTuanTruoc = function(tuanHienTaiXet, mangLop, khungChuanTheoLop) {
    let tTarget = parseInt(String(tuanHienTaiXet).replace(/\D/g, ''), 10) || 1;
    let soDuLuyKe = {};
    let chiTietTheoTuan = {};

    mangLop.forEach(lop => {
        soDuLuyKe[lop] = {};
        chiTietTheoTuan[lop] = {};
    });

    if (tTarget <= 1 || typeof window.sangLocTkbTuanDaCo !== 'function') {
        return { soDuLuyKe, chiTietTheoTuan };
    }

    for (let t = 1; t < tTarget; t++) {
        let kqTuanCu = window.sangLocTkbTuanDaCo(t, 'DATA_TKB');
        if (!kqTuanCu || !Array.isArray(kqTuanCu.ds) || kqTuanCu.ds.length === 0) {
            kqTuanCu = window.sangLocTkbTuanDaCo(t, 'TKB_HIEN_TAI');
        }
        if (!kqTuanCu || !Array.isArray(kqTuanCu.ds) || kqTuanCu.ds.length === 0) continue;

        let demTuanT = {};
        let lopCoTietTuanT = new Set();

        kqTuanCu.ds.forEach(banGhi => {
            let lop = String(banGhi.maLop || '').trim();
            let mon = window.chuanHoaTenMonKCT(banGhi.monHoc || banGhi.mon);
            if (lop && mon && mon !== '--' && mon !== '---') {
                if (!demTuanT[lop]) demTuanT[lop] = {};
                demTuanT[lop][mon] = (demTuanT[lop][mon] || 0) + 1;
                lopCoTietTuanT.add(lop);
            }
        });

        mangLop.forEach(lop => {
            if (!lopCoTietTuanT.has(lop)) return;
            let dmLop = khungChuanTheoLop[lop] || {};
            let thucTeLop = demTuanT[lop] || {};
            let tapMon = new Set([...Object.keys(dmLop), ...Object.keys(thucTeLop)]);

            tapMon.forEach(mon => {
                let chuan = dmLop[mon] || 0;
                let daDay = thucTeLop[mon] || 0;
                let deltaT = daDay - chuan;
                if (deltaT !== 0) {
                    soDuLuyKe[lop][mon] = (soDuLuyKe[lop][mon] || 0) + deltaT;
                    if (!chiTietTheoTuan[lop][mon]) chiTietTheoTuan[lop][mon] = [];
                    chiTietTheoTuan[lop][mon].push(`T${t}(${deltaT > 0 ? '+' + deltaT : deltaT})`);
                }
            });
        });
    }

    return { soDuLuyKe, chiTietTheoTuan };
};

// -------------------------------------------------------------------------
// HÀM 4: Thuật toán lõi phân tích Thiếu / Thừa / Đẩy / Thế / Bù - Trả tiết
// -------------------------------------------------------------------------
window.phanTichChiTietDinhMucTungMon = function(lopMucTieu = null) {
    const khungCT = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.KHUNG_CHUONG_TRINH)
        ? thongSoHocVu.KHUNG_CHUONG_TRINH
        : {};
    const namHoc = (typeof thongSoHocVu !== 'undefined' && thongSoHocVu.NAM_HOC)
        ? thongSoHocVu.NAM_HOC
        : 'NH';
    const tuanXet = (typeof tuanDangXem !== 'undefined' && tuanDangXem) ? parseInt(tuanDangXem, 10) : 1;

    let mangLop = [];
    if (lopMucTieu) {
        mangLop = [lopMucTieu];
    } else {
        const cacThLop = document.querySelectorAll('#tieuDeBang th[colspan="2"][data-cotlop]');
        cacThLop.forEach(th => {
            let tenLop = th.getAttribute('data-cotlop');
            if (tenLop && !mangLop.includes(tenLop)) mangLop.push(tenLop);
        });
        if (mangLop.length === 0 && typeof thongSoHocVu !== 'undefined' && Array.isArray(thongSoHocVu.DANH_SACH_LOP)) {
            mangLop = [...thongSoHocVu.DANH_SACH_LOP];
        }
    }

    // Chuẩn hóa Khung chương trình
    let khungChuanTheoLop = {};
    mangLop.forEach(lop => {
        let dmGoc = khungCT[lop] || {};
        khungChuanTheoLop[lop] = {};
        Object.keys(dmGoc).forEach(m => {
            let mChuan = window.chuanHoaTenMonKCT(m);
            let soTiet = parseInt(dmGoc[m], 10) || 0;
            if (mChuan && soTiet > 0) khungChuanTheoLop[lop][mChuan] = soTiet;
        });
    });

    // Tính số dư lũy kế từ các tuần trước
    const soCaiLichSu = window.tinhSoDuLuyKeCacTuanTruoc(tuanXet, mangLop, khungChuanTheoLop);

    let demThucTe = {};
    let demDayTiet = {};
    let demTheTiet = {};
    let viTriMonTheoLop = {};

    mangLop.forEach(lop => {
        demThucTe[lop] = {};
        demDayTiet[lop] = {};
        demTheTiet[lop] = {};
        viTriMonTheoLop[lop] = {};
    });

    const selector = lopMucTieu
        ? `input[id^="mon_"][id$="_${lopMucTieu}"]`
        : `input[id^="mon_"]`;
    const cacOMon = document.querySelectorAll(selector);

    cacOMon.forEach(oMon => {
        let parts = oMon.id.split('_');
        if (parts.length < 5) return;
        let thu = parts[1], buoi = parts[2], tiet = parts[3], lop = parts.slice(4).join('_');
        if (!demThucTe[lop]) return;

        let tenMon = window.chuanHoaTenMonKCT(oMon.value);
        if (tenMon !== '' && tenMon !== '--' && tenMon !== '---') {
            demThucTe[lop][tenMon] = (demThucTe[lop][tenMon] || 0) + 1;

            if (!viTriMonTheoLop[lop][tenMon]) viTriMonTheoLop[lop][tenMon] = [];
            viTriMonTheoLop[lop][tenMon].push(`${thu} (${buoi} T${tiet})`);

            let maO = `${namHoc}_${tuanDangXem}_${thu}_${buoi}_${tiet}_${lop}`;
            let loaiCo = window.trangThaiDacBietTKB[maO] || '';
            if (loaiCo === 'DAY_TIET') {
                demDayTiet[lop][tenMon] = (demDayTiet[lop][tenMon] || 0) + 1;
            } else if (loaiCo === 'THE_TIET') {
                demTheTiet[lop][tenMon] = (demTheTiet[lop][tenMon] || 0) + 1;
            }
        }
    });

    let ketQuaToanTruong = {};

    mangLop.forEach(lop => {
        let dmChuongTrinhLop = khungChuanTheoLop[lop] || {};
        let tkThucTeLop = demThucTe[lop] || {};
        let duTruocLop = soCaiLichSu.soDuLuyKe[lop] || {};
        let vetTuanLop = soCaiLichSu.chiTietTheoTuan[lop] || {};

        let tapHopMon = new Set([
            ...Object.keys(dmChuongTrinhLop),
            ...Object.keys(tkThucTeLop),
            ...Object.keys(duTruocLop)
        ]);

        let dsMonThieu = [];
        let dsMonThua = [];
        let dsMonDayTiet = [];
        let dsMonDaTraBuKhop = [];
        let dsMonCanBuTuTuanTruoc = [];
        let dsMonKhop = [];
        let chiTietTungMon = {};
        let tongTietChuan = 0;
        let tongTietDaXep = 0;

        tapHopMon.forEach(mon => {
            if (!mon || mon === 'undefined') return;
            let soTietChuan = dmChuongTrinhLop[mon] || 0;
            let soTietXep = tkThucTeLop[mon] || 0;
            let soTietDay = demDayTiet[lop][mon] || 0;
            let soTietThe = demTheTiet[lop][mon] || 0;
            let chenhLech = soTietXep - soTietChuan;
            let noDuTruoc = duTruocLop[mon] || 0;
            let soDuSauTuanNay = noDuTruoc + chenhLech;
            let lichSuTuan = (vetTuanLop[mon] || []).join(', ');

            if (soTietChuan === 0 && soTietXep === 0 && noDuTruoc === 0) return;

            tongTietChuan += soTietChuan;
            tongTietDaXep += soTietXep;

            if (noDuTruoc !== 0) {
                dsMonCanBuTuTuanTruoc.push({
                    mon,
                    noDuTruoc,
                    soDuSauTuanNay,
                    lichSuTuan
                });
            }

            let trangThaiMon = 'KHOP';
            let dienGiaiLuyKe = '';

            if (chenhLech < 0) {
                if (noDuTruoc > 0 && soDuSauTuanNay === 0) {
                    trangThaiMon = 'DA_TRA_BU_KHOP';
                    dienGiaiLuyKe = `✔ Giảm ${Math.abs(chenhLech)} tiết để trả/nghỉ bù khớp cho ${lichSuTuan}`;
                    dsMonDaTraBuKhop.push({ mon, chuan: soTietChuan, daXep: soTietXep, chenhLech, lichSuTuan });
                } else {
                    trangThaiMon = 'THIEU';
                    dienGiaiLuyKe = noDuTruoc > 0
                        ? `Trả ${Math.abs(chenhLech)} tiết từ ${lichSuTuan} (Lũy kế: ${soDuSauTuanNay})`
                        : `Thiếu ${Math.abs(chenhLech)} tiết (Chờ bù tuần sau)`;
                    dsMonThieu.push({
                        mon: mon,
                        chuan: soTietChuan,
                        daXep: soTietXep,
                        soThieu: Math.abs(chenhLech),
                        noDuTruoc: noDuTruoc,
                        soDuSauTuanNay: soDuSauTuanNay,
                        lichSuTuan: lichSuTuan
                    });
                }
            } else if (chenhLech > 0) {
                if (noDuTruoc < 0 && soDuSauTuanNay === 0) {
                    trangThaiMon = 'DA_TRA_BU_KHOP';
                    dienGiaiLuyKe = `✔ Tăng +${chenhLech} tiết để dạy bù khớp cho ${lichSuTuan}`;
                    dsMonDaTraBuKhop.push({ mon, chuan: soTietChuan, daXep: soTietXep, chenhLech, lichSuTuan });
                } else if (soTietDay >= chenhLech && soTietChuan > 0) {
                    trangThaiMon = 'DAY_TIET';
                    dienGiaiLuyKe = `Đã gắn nhãn [ĐẨY +${chenhLech} tiết]`;
                    dsMonDayTiet.push({
                        mon: mon,
                        chuan: soTietChuan,
                        daXep: soTietXep,
                        soThua: chenhLech,
                        soDay: soTietDay
                    });
                } else {
                    trangThaiMon = 'THUA';
                    dienGiaiLuyKe = noDuTruoc < 0
                        ? `Dạy bù +${chenhLech} tiết cho ${lichSuTuan} (Lũy kế: ${soDuSauTuanNay > 0 ? '+' + soDuSauTuanNay : soDuSauTuanNay})`
                        : `Vượt +${chenhLech} tiết (Đẩy trước hoặc dạy thế môn khác)`;
                    dsMonThua.push({
                        mon: mon,
                        chuan: soTietChuan,
                        daXep: soTietXep,
                        soThua: chenhLech,
                        ngoaiKhung: (soTietChuan === 0),
                        noDuTruoc: noDuTruoc,
                        soDuSauTuanNay: soDuSauTuanNay,
                        lichSuTuan: lichSuTuan
                    });
                }
            } else {
                dsMonKhop.push({ mon: mon, chuan: soTietChuan, daXep: soTietXep });
                if (noDuTruoc !== 0) {
                    dienGiaiLuyKe = noDuTruoc < 0
                        ? `⏳ Còn nợ ${noDuTruoc} tiết từ ${lichSuTuan} (chưa bù)`
                        : `📌 Đang dư +${noDuTruoc} tiết từ ${lichSuTuan} (chưa giảm)`;
                }
            }

            chiTietTungMon[mon] = {
                mon: mon,
                chuan: soTietChuan,
                daXep: soTietXep,
                chenhLech: chenhLech,
                noDuTruoc: noDuTruoc,
                soDuSauTuanNay: soDuSauTuanNay,
                lichSuTuan: lichSuTuan,
                dienGiaiLuyKe: dienGiaiLuyKe,
                soDayTiet: soTietDay,
                soTheTiet: soTietThe,
                trangThai: trangThaiMon,
                cacViTri: viTriMonTheoLop[lop][mon] || []
            };
        });

        let conLechLuyKe = Object.values(chiTietTungMon).some(m => m.soDuSauTuanNay !== 0);
        let laTheTietNoiBo = (tongTietDaXep === tongTietChuan && dsMonThieu.length > 0 && dsMonThua.length > 0);

        ketQuaToanTruong[lop] = {
            lop: lop,
            tongChuan: tongTietChuan,
            tongDaXep: tongTietDaXep,
            dsMonThieu: dsMonThieu,
            dsMonThua: dsMonThua,
            dsMonDayTiet: dsMonDayTiet,
            dsMonDaTraBuKhop: dsMonDaTraBuKhop,
            dsMonCanBuTuTuanTruoc: dsMonCanBuTuTuanTruoc,
            dsMonKhop: dsMonKhop,
            chiTietTungMon: chiTietTungMon,
            laTheTietNoiBo: laTheTietNoiBo,
            conLechLuyKe: conLechLuyKe,
            hoanHao: (dsMonThieu.length === 0 && dsMonThua.length === 0 && tongTietChuan > 0),
            daCanBangLuyKe: (dsMonThieu.length === 0 && dsMonThua.length === 0 && dsMonDaTraBuKhop.length > 0 && !conLechLuyKe)
        };
    });

    return ketQuaToanTruong;
};

// -------------------------------------------------------------------------
// HÀM 5: Huy hiệu cột Lớp, Tô viền cam ô thừa & Banner Nhắc Bù/Trả đầu tuần
// -------------------------------------------------------------------------
let _timerCapNhatCanhBaoMon = null;
window.capNhatCanhBaoChiTietMonTrenLuoi = function(lopCuThe = null) {
    if (_timerCapNhatCanhBaoMon) clearTimeout(_timerCapNhatCanhBaoMon);
    _timerCapNhatCanhBaoMon = setTimeout(() => {
        const ketQua = window.phanTichChiTietDinhMucTungMon(lopCuThe);

        Object.keys(ketQua).forEach(lop => {
            let kqLop = ketQua[lop];
            let thLop = document.querySelector(`#tieuDeBang th[colspan="2"][data-cotlop="${lop}"]`);
            if (!thLop) return;

            let vungCu = thLop.querySelector('.vung-chi-tiet-mon-header');
            if (vungCu) vungCu.remove();

            if (kqLop.tongChuan === 0 && kqLop.tongDaXep === 0) return;

            let chuoiThieu = kqLop.dsMonThieu.map(x => `${x.mon} (-${x.soThieu})`).join(', ');
            let chuoiThua = kqLop.dsMonThua.map(x => `${x.mon} (+${x.soThua})`).join(', ');
            let chuoiDay = kqLop.dsMonDayTiet.map(x => `${x.mon} (+${x.soThua} Đẩy)`).join(', ');
            let chuoiTraKhop = kqLop.dsMonDaTraBuKhop.map(x => `${x.mon} (${x.chenhLech > 0 ? '+' + x.chenhLech : x.chenhLech})`).join(', ');

            let htmlHeader = '';

            if (kqLop.daCanBangLuyKe) {
                htmlHeader = `
                    <div onclick="window.moPopupChiTietMonCuaLop('${lop}')" class="vung-chi-tiet-mon-header mt-0.5 px-1.5 py-0.5 bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-500 rounded text-[10px] font-extrabold cursor-pointer transition-colors leading-tight mx-1 truncate" title="Lớp ${lop}: Đã Bù/Trả tiết khớp 100% với tuần trước (${chuoiTraKhop}). Bấm để xem chi tiết.">
                        ✔ Đã bù/trả khớp (${kqLop.tongDaXep}/${kqLop.tongChuan})
                    </div>`;
            } else if (kqLop.dsMonThieu.length === 0 && kqLop.dsMonThua.length === 0 && kqLop.dsMonDayTiet.length === 0) {
                htmlHeader = `
                    <div onclick="window.moPopupChiTietMonCuaLop('${lop}')" class="vung-chi-tiet-mon-header mt-0.5 px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-400 rounded text-[10px] font-bold cursor-pointer transition-colors leading-tight mx-1" title="Bấm để xem chi tiết từng môn của lớp ${lop}">
                        ✔ Đủ chuẩn (${kqLop.tongDaXep}/${kqLop.tongChuan} tiết)
                    </div>`;
            } else {
                let dongTomTat = [];
                if (kqLop.laTheTietNoiBo) dongTomTat.push(`<span class="text-purple-800">⇄ Thế tiết</span>`);
                if (kqLop.dsMonThieu.length > 0) dongTomTat.push(`<span class="text-rose-700">Thiếu: ${chuoiThieu}</span>`);
                if (kqLop.dsMonThua.length > 0) dongTomTat.push(`<span class="text-amber-800">Thừa: ${chuoiThua}</span>`);
                if (kqLop.dsMonDayTiet.length > 0) dongTomTat.push(`<span class="text-blue-700">Đẩy: ${chuoiDay}</span>`);

                let mauKhung = kqLop.laTheTietNoiBo
                    ? 'bg-amber-50 border-amber-400 hover:bg-amber-100'
                    : (kqLop.dsMonThieu.length > 0
                        ? 'bg-rose-50 border-rose-400 hover:bg-rose-100'
                        : (kqLop.dsMonThua.length > 0 ? 'bg-amber-50 border-amber-400 hover:bg-amber-100' : 'bg-blue-50 border-blue-400 hover:bg-blue-100'));

                let tooltipChiTiet = `LỚP ${lop} (Tổng đã xếp: ${kqLop.tongDaXep}/${kqLop.tongChuan} tiết)\n` +
                    (kqLop.laTheTietNoiBo ? `⇄ ĐANG DẠY THẾ / ĐỔI TIẾT KHÁC MÔN TRONG TUẦN\n` : '') +
                    (chuoiThieu ? `❌ THIẾU / NHƯỜNG TIẾT: ${chuoiThieu}\n` : '') +
                    (chuoiThua ? `⚠️ THỪA / DẠY THẾ: ${chuoiThua}\n` : '') +
                    (chuoiDay ? `📘 ĐẨY TIẾT: ${chuoiDay}\n` : '') +
                    (chuoiTraKhop ? `✔ ĐÃ BÙ/TRẢ KHỚP: ${chuoiTraKhop}\n` : '') +
                    `\n(Nhấp chuột vào đây để xem bảng đối soát & sổ cái bù/trả của lớp ${lop})`;

                htmlHeader = `
                    <div onclick="window.moPopupChiTietMonCuaLop('${lop}')" class="vung-chi-tiet-mon-header mt-0.5 px-1.5 py-0.5 ${mauKhung} border rounded text-[10px] font-extrabold cursor-pointer transition-colors leading-tight mx-1 max-w-[230px] truncate" title="${tooltipChiTiet}">
                        <span class="underline">${kqLop.tongDaXep}/${kqLop.tongChuan}:</span> ${dongTomTat.join(' | ')}
                    </div>`;
            }

            thLop.insertAdjacentHTML('beforeend', htmlHeader);

            const cacOMonLopNay = document.querySelectorAll(`input[id^="mon_"][id$="_${lop}"]`);
            cacOMonLopNay.forEach(oMon => {
                let tenMon = window.chuanHoaTenMonKCT(oMon.value);
                let td = oMon.closest('td');
                if (!td) return;

                let thongTinMon = kqLop.chiTietTungMon[tenMon];
                if (tenMon && thongTinMon && thongTinMon.trangThai === 'THUA') {
                    oMon.title = `⚠️ Môn [${tenMon}] của lớp ${lop} đang xếp ${thongTinMon.daXep}/${thongTinMon.chuan} tiết (Thừa +${thongTinMon.chenhLech} tiết).\n- Nếu là dạy đẩy tiết/dạy bù: Giữ phím Alt + Click chuột trái vào ô này để đánh dấu [ĐẨY].`;
                    td.style.boxShadow = 'inset 0 0 0 2px #f59e0b';
                } else if (tenMon && thongTinMon && thongTinMon.trangThai === 'DA_TRA_BU_KHOP') {
                    oMon.title = `✔ Môn [${tenMon}] - Lớp ${lop}: ${thongTinMon.dienGiaiLuyKe}`;
                    td.style.boxShadow = 'inset 0 0 0 2px #14b8a6';
                } else if (tenMon && thongTinMon) {
                    oMon.title = `✔ Môn [${tenMon}] - Lớp ${lop}: Đã xếp ${thongTinMon.daXep}/${thongTinMon.chuan} tiết.`;
                    td.style.boxShadow = '';
                } else {
                    oMon.title = '';
                    td.style.boxShadow = '';
                }
            });
        });

        if (!lopCuThe) window.capNhatBannerNhacNoLuyKe(ketQua);
    }, 100);
};

window.capNhatBannerNhacNoLuyKe = function(ketQuaToanTruong) {
    let dsLopConNoCu = [];
    Object.values(ketQuaToanTruong).forEach(kqLop => {
        let monChuaXuLy = kqLop.dsMonCanBuTuTuanTruoc.filter(x => x.soDuSauTuanNay !== 0);
        if (monChuaXuLy.length > 0) {
            let chiTiet = monChuaXuLy.map(x => {
                return x.noDuTruoc < 0
                    ? `${x.mon} (thiếu ${Math.abs(x.noDuTruoc)} từ ${x.lichSuTuan})`
                    : `${x.mon} (dư +${x.noDuTruoc} từ ${x.lichSuTuan})`;
            }).join(', ');
            dsLopConNoCu.push(`<span onclick="window.moPopupChiTietMonCuaLop('${kqLop.lop}')" class="inline-block bg-white hover:bg-amber-100 border border-amber-300 rounded px-2 py-0.5 mr-1.5 mb-1 cursor-pointer"><b>Lớp ${kqLop.lop}:</b> ${chiTiet}</span>`);
        }
    });

    let banner = document.getElementById('bannerNhacLichBuTraTKB');
    if (dsLopConNoCu.length > 0) {
        if (!banner) {
            let khungTKB = document.getElementById('khungTKB');
            if (khungTKB) {
                khungTKB.insertAdjacentHTML('afterbegin', `<div id="bannerNhacLichBuTraTKB" class="mb-2 p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs shadow-sm"></div>`);
                banner = document.getElementById('bannerNhacLichBuTraTKB');
            }
        }
        if (banner) {
            banner.style.display = 'block';
            banner.innerHTML = `
                <div class="flex items-center justify-between gap-2 mb-1">
                    <span class="font-extrabold uppercase text-amber-900">🔔 Sổ cái nhắc lịch Bù / Trả tiết từ tuần trước (Bấm vào từng lớp để xem & đối chiếu):</span>
                    <button onclick="kiemTraDinhMuc('CHI_LOI')" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-0.5 rounded text-[11px] cursor-pointer flex-none">Mở Sổ cái toàn trường</button>
                </div>
                <div class="leading-relaxed">${dsLopConNoCu.slice(0, 6).join('')}${dsLopConNoCu.length > 6 ? `<span class="font-bold">+${dsLopConNoCu.length - 6} lớp khác...</span>` : ''}</div>
            `;
        }
    } else if (banner) {
        banner.style.display = 'none';
    }
};

// -------------------------------------------------------------------------
// HÀM 6: Thanh trợ lý gợi ý & Điền nhanh môn còn thiếu dưới đáy màn hình
// -------------------------------------------------------------------------
window.hienThiGoiYMonConThieuKhiFocus = function(inputEl) {
    if (!inputEl || !inputEl.id || !inputEl.id.startsWith('mon_')) return;
    let parts = inputEl.id.split('_');
    if (parts.length < 5) return;
    let thu = parts[1], buoi = parts[2], tiet = parts[3], lop = parts.slice(4).join('_');

    let kq = window.phanTichChiTietDinhMucTungMon(lop)[lop];
    if (!kq) return;

    let thanhGoiY = document.getElementById('thanhGoiYDinhMucLop');
    if (!thanhGoiY) {
        thanhGoiY = document.createElement('div');
        thanhGoiY.id = 'thanhGoiYDinhMucLop';
        thanhGoiY.className = 'fixed bottom-4 left-4 right-4 md:left-72 md:right-6 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-600 z-[9990] flex flex-wrap items-center justify-between gap-2 text-xs transition-all duration-200';
        document.body.appendChild(thanhGoiY);
    }

    let htmlThieu = kq.dsMonThieu.length > 0
        ? kq.dsMonThieu.map(m => `<button type="button" onmousedown="window.dienNhanhMonConThieu('${inputEl.id}', '${m.mon}')" class="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded shadow-sm cursor-pointer transition-colors" title="Bấm để điền nhanh môn ${m.mon} vào ô đang chọn">${m.mon}: thiếu ${m.soThieu} (${m.daXep}/${m.chuan})</button>`).join(' ')
        : `<span class="text-emerald-400 font-bold">✔ Đủ định mức tuần</span>`;

    let monNoTuanTruoc = kq.dsMonCanBuTuTuanTruoc.filter(x => x.noDuTruoc < 0 && x.soDuSauTuanNay < 0);
    let htmlNoCu = monNoTuanTruoc.length > 0
        ? monNoTuanTruoc.map(m => `<button type="button" onmousedown="window.dienNhanhMonConThieu('${inputEl.id}', '${m.mon}')" class="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow-sm cursor-pointer transition-colors" title="Môn này đang nợ từ ${m.lichSuTuan}. Bấm để điền dạy bù!">${m.mon}: cần bù +${Math.abs(m.soDuSauTuanNay)} (${m.lichSuTuan})</button>`).join(' ')
        : '';

    let htmlThua = kq.dsMonThua.length > 0
        ? kq.dsMonThua.map(m => `<span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold rounded">${m.mon}: thừa +${m.soThua} (${m.daXep}/${m.chuan})</span>`).join(' ')
        : '';

    thanhGoiY.innerHTML = `
        <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 bg-blue-600 text-white font-extrabold rounded-lg uppercase tracking-wider">Lớp ${lop} (${thu} - ${buoi} T${tiet})</span>
            <span class="font-bold text-slate-300">Tổng: <strong class="text-white">${kq.tongDaXep}/${kq.tongChuan}</strong> tiết</span>
            <span class="text-slate-500">|</span>
            <span class="font-semibold text-rose-300">Thiếu tuần này:</span>
            <div class="flex flex-wrap items-center gap-1.5">${htmlThieu}</div>
            ${htmlNoCu ? `<span class="text-slate-500">|</span><span class="font-semibold text-purple-300">Nợ tuần trước:</span><div class="flex flex-wrap items-center gap-1.5">${htmlNoCu}</div>` : ''}
            ${htmlThua ? `<span class="text-slate-500">|</span><span class="font-semibold text-amber-300">Đang dư:</span><div class="flex flex-wrap items-center gap-1.5">${htmlThua}</div>` : ''}
        </div>
        <div class="flex items-center gap-2 ml-auto">
            <span class="text-[11px] text-slate-400 hidden xl:inline">Mẹo: Bấm nút môn để điền nhanh | Alt+Click vào ô để gắn nhãn [ĐẨY] / [THẾ]</span>
            <button type="button" onclick="document.getElementById('thanhGoiYDinhMucLop').classList.add('hidden')" class="text-slate-400 hover:text-white font-bold px-1.5 py-0.5 rounded">✕</button>
        </div>
    `;
    thanhGoiY.classList.remove('hidden');
};

window.dienNhanhMonConThieu = function(idInputMon, tenMon) {
    let oMon = document.getElementById(idInputMon);
    if (!oMon || oMon.disabled) return;
    oMon.value = tenMon;
    oMon.dataset.val = tenMon;
    if (typeof window.xacThucGiaTriHopLe === 'function') window.xacThucGiaTriHopLe(oMon, 'mon');
    if (typeof window.danhDauDongThayDoiTKB === 'function') window.danhDauDongThayDoiTKB(oMon);
    let parts = idInputMon.split('_');
    let lop = parts.length >= 5 ? parts.slice(4).join('_') : null;
    window.capNhatCanhBaoChiTietMonTrenLuoi(lop);
    setTimeout(() => window.hienThiGoiYMonConThieuKhiFocus(oMon), 50);
};

// -------------------------------------------------------------------------
// HÀM 7: Pop-up Chi tiết 1 Lớp & Bảng Kiểm toán Toàn trường (Có Sổ cái Lũy kế)
// -------------------------------------------------------------------------
window.moPopupChiTietMonCuaLop = function(lop) {
    let kq = window.phanTichChiTietDinhMucTungMon(lop)[lop];
    if (!kq) return;

    let dsMon = Object.values(kq.chiTietTungMon).sort((a, b) => {
        const thuTu = { 'THIEU': 1, 'THUA': 2, 'DA_TRA_BU_KHOP': 3, 'DAY_TIET': 4, 'KHOP': 5 };
        return (thuTu[a.trangThai] || 9) - (thuTu[b.trangThai] || 9);
    });

    let dongBang = dsMon.map(m => {
        let nhanTrangThai = '';
        let mauDong = '';
        if (m.trangThai === 'THIEU') {
            nhanTrangThai = `<span class="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-extrabold">⚠ Thiếu ${Math.abs(m.chenhLech)} tiết</span>`;
            mauDong = 'bg-rose-50/70';
        } else if (m.trangThai === 'THUA') {
            nhanTrangThai = `<span class="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-extrabold">⚠ Thừa +${m.chenhLech} tiết${m.chuan === 0 ? ' (Ngoài KCT)' : ''}</span>`;
            mauDong = 'bg-amber-50/70';
        } else if (m.trangThai === 'DA_TRA_BU_KHOP') {
            nhanTrangThai = `<span class="px-2 py-0.5 bg-teal-100 text-teal-900 border border-teal-400 rounded font-extrabold">✔ Đã bù/trả khớp (${m.chenhLech > 0 ? '+' + m.chenhLech : m.chenhLech})</span>`;
            mauDong = 'bg-teal-50/70';
        } else if (m.trangThai === 'DAY_TIET') {
            nhanTrangThai = `<span class="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded font-extrabold">📘 Đẩy +${m.chenhLech} tiết</span>`;
            mauDong = 'bg-blue-50/60';
        } else {
            nhanTrangThai = `<span class="text-emerald-700 font-bold">✔ Đủ tiết</span>`;
        }

        let htmlNoCu = m.noDuTruoc === 0
            ? '<span class="text-slate-400">0</span>'
            : `<span class="${m.noDuTruoc < 0 ? 'text-rose-700' : 'text-purple-700'} font-extrabold">${m.noDuTruoc > 0 ? '+' + m.noDuTruoc : m.noDuTruoc}</span> <span class="text-[11px] text-slate-500">(${m.lichSuTuan})</span>`;

        let htmlLuyKe = m.soDuSauTuanNay === 0
            ? '<span class="text-emerald-700 font-bold">✔ Cân bằng (0)</span>'
            : `<span class="${m.soDuSauTuanNay < 0 ? 'text-rose-700' : 'text-purple-700'} font-extrabold">${m.soDuSauTuanNay > 0 ? 'Dư +' + m.soDuSauTuanNay : 'Nợ ' + Math.abs(m.soDuSauTuanNay)}</span>`;

        return `
            <tr class="${mauDong} border-b border-slate-300 hover:bg-slate-100">
                <td class="p-2 border-r border-slate-300 text-left font-bold text-slate-900 pl-3">${m.mon}</td>
                <td class="p-2 border-r border-slate-300 font-bold text-slate-700">${m.chuan}</td>
                <td class="p-2 border-r border-slate-300 font-extrabold text-blue-700 text-base">${m.daXep}</td>
                <td class="p-2 border-r border-slate-300">${nhanTrangThai}</td>
                <td class="p-2 border-r border-slate-300">${htmlNoCu}</td>
                <td class="p-2 border-r border-slate-300">${htmlLuyKe}</td>
                <td class="p-2 text-left text-xs text-slate-600 pl-3">${m.cacViTri.join(', ') || '<span class="italic text-rose-500">Chưa xếp tiết nào</span>'}</td>
            </tr>`;
    }).join('');

    let html = `
        <div class="mb-3 p-3 bg-slate-100 rounded-lg border border-slate-300 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div>
                <span class="font-extrabold text-blue-900 text-base uppercase">CHI TIẾT ĐỊNH MỨC & SỔ CÁI BÙ/TRẢ - LỚP ${lop}</span>
                <span class="ml-3 font-bold text-slate-700">Tổng tiết Tuần ${tuanDangXem}: <strong class="text-blue-700">${kq.tongDaXep}</strong> / ${kq.tongChuan} tiết chuẩn</span>
            </div>
            <button onclick="kiemTraDinhMuc('TAT_CA')" class="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded text-xs cursor-pointer">Xem toàn trường</button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-center border-collapse border border-slate-400">
                <thead class="bg-slate-200 text-slate-900 font-bold">
                    <tr>
                        <th class="border border-slate-400 p-2 text-left pl-3">Môn học</th>
                        <th class="border border-slate-400 p-2 w-20">Chuẩn</th>
                        <th class="border border-slate-400 p-2 w-20">Đã xếp</th>
                        <th class="border border-slate-400 p-2 w-36">Trạng thái Tuần</th>
                        <th class="border border-slate-400 p-2 w-28 bg-amber-100">Nợ/Dư trước</th>
                        <th class="border border-slate-400 p-2 w-28 bg-teal-100">Lũy kế sau T${tuanDangXem}</th>
                        <th class="border border-slate-400 p-2 text-left pl-3">Vị trí các tiết đã xếp trong tuần</th>
                    </tr>
                </thead>
                <tbody>${dongBang}</tbody>
            </table>
        </div>`;

    let noiDungModal = document.getElementById('noiDungKiemTra');
    let modal = document.getElementById('modalKiemTra');
    if (noiDungModal && modal) {
        noiDungModal.innerHTML = html;
        modal.classList.remove('hidden');
    }
};

window.kiemTraDinhMuc = function(cheDoLoc = 'TAT_CA') {
    if (typeof window.khoaNutThaoTacTKB === 'function') window.khoaNutThaoTacTKB(true, 'Đang kiểm toán từng môn');

    const ketQuaToanTruong = window.phanTichChiTietDinhMucTungMon();
    const mangLop = Object.keys(ketQuaToanTruong);

    let tongLopLoi = 0;
    let tongMonThieuToanTruong = 0;
    let tongMonThuaToanTruong = 0;

    mangLop.forEach(lop => {
        let kq = ketQuaToanTruong[lop];
        if (!kq.hoanHao && !kq.daCanBangLuyKe) tongLopLoi++;
        tongMonThieuToanTruong += kq.dsMonThieu.length;
        tongMonThuaToanTruong += kq.dsMonThua.length;
    });

    let htmlKetQua = `
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2.5 rounded-lg border border-slate-300">
            <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="px-2.5 py-1 rounded bg-rose-100 text-rose-800 border border-rose-300">Lớp còn lệch lũy kế: ${tongLopLoi}/${mangLop.length}</span>
                <span class="px-2.5 py-1 rounded bg-rose-600 text-white">Môn thiếu tiết: ${tongMonThieuToanTruong}</span>
                <span class="px-2.5 py-1 rounded bg-amber-500 text-white">Môn thừa/đẩy tiết: ${tongMonThuaToanTruong}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs font-bold">
                <button onclick="kiemTraDinhMuc('TAT_CA')" class="px-2.5 py-1 rounded cursor-pointer ${cheDoLoc === 'TAT_CA' ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 border border-slate-300'}">Tất cả các môn</button>
                <button onclick="kiemTraDinhMuc('CHI_LOI')" class="px-2.5 py-1 rounded cursor-pointer ${cheDoLoc === 'CHI_LOI' ? 'bg-rose-700 text-white' : 'bg-white text-rose-700 border border-rose-300'}">Chỉ hiện môn Thiếu / Thừa / Bù trả</button>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-center border-collapse border border-gray-400" style="font-family:'Times New Roman',Times,serif;">
                <thead class="bg-purple-100 text-purple-900 font-bold">
                    <tr>
                        <th class="border border-gray-400 p-2 min-w-[60px]">Lớp</th>
                        <th class="border border-gray-400 p-2 min-w-[130px]">Môn học</th>
                        <th class="border border-gray-400 p-2 min-w-[70px]">Chuẩn</th>
                        <th class="border border-gray-400 p-2 min-w-[75px]">Đang xếp</th>
                        <th class="border border-gray-400 p-2 min-w-[155px]">Trạng thái Tuần ${tuanDangXem}</th>
                        <th class="border border-gray-400 p-2 min-w-[110px] bg-amber-100 text-amber-900">Nợ/Dư tuần trước</th>
                        <th class="border border-gray-400 p-2 min-w-[120px] bg-teal-100 text-teal-900">Lũy kế sau T${tuanDangXem}</th>
                        <th class="border border-gray-400 p-2 min-w-[195px] bg-slate-100 text-slate-900">Tổng hợp theo Lớp</th>
                    </tr>
                </thead>
                <tbody>`;

    let tongTatCaTietChuan = 0;
    let tongTatCaTietUI = 0;

    mangLop.forEach(lop => {
        let kqLop = ketQuaToanTruong[lop];
        tongTatCaTietChuan += kqLop.tongChuan;
        tongTatCaTietUI += kqLop.tongDaXep;

        let dsMonRender = Object.values(kqLop.chiTietTungMon);
        if (cheDoLoc === 'CHI_LOI') {
            dsMonRender = dsMonRender.filter(m => m.trangThai !== 'KHOP' || m.noDuTruoc !== 0);
        }

        if (dsMonRender.length === 0) return;

        let tomTatThieu = kqLop.dsMonThieu.length > 0
            ? `<div class="text-xs text-rose-700 font-bold mt-1 text-left">❌ Thiếu: ${kqLop.dsMonThieu.map(x => `${x.mon} (-${x.soThieu})`).join(', ')}</div>`
            : '';
        let tomTatThua = kqLop.dsMonThua.length > 0
            ? `<div class="text-xs text-amber-800 font-bold mt-1 text-left">⚠️ Thừa: ${kqLop.dsMonThua.map(x => `${x.mon} (+${x.soThua})`).join(', ')}</div>`
            : '';
        let tomTatDay = kqLop.dsMonDayTiet.length > 0
            ? `<div class="text-xs text-blue-700 font-bold mt-1 text-left">📘 Đẩy tiết: ${kqLop.dsMonDayTiet.map(x => `${x.mon} (+${x.soThua})`).join(', ')}</div>`
            : '';
        let tomTatTraKhop = kqLop.dsMonDaTraBuKhop.length > 0
            ? `<div class="text-xs text-teal-800 font-extrabold mt-1 text-left">✔ Đã bù/trả khớp: ${kqLop.dsMonDaTraBuKhop.map(x => `${x.mon} (${x.chenhLech > 0 ? '+' + x.chenhLech : x.chenhLech})`).join(', ')}</div>`
            : '';
        let tomTatHoanHao = kqLop.hoanHao
            ? `<div class="text-xs text-emerald-700 font-extrabold mt-1">✔ Khớp chuẩn 100% các môn</div>`
            : '';

        dsMonRender.forEach((m, index) => {
            let trangThaiHTML = `<span class="text-green-700 font-bold">✔ Đủ (${m.daXep}/${m.chuan})</span>`;
            let cssRow = "";

            if (m.trangThai === 'THIEU') {
                trangThaiHTML = `<span class="text-red-600 font-extrabold">⚠ Thiếu ${Math.abs(m.chenhLech)} tiết</span>`;
                cssRow = "bg-red-50/60";
            } else if (m.trangThai === 'THUA') {
                trangThaiHTML = `<span class="text-orange-600 font-extrabold">⚠ Thừa +${m.chenhLech} tiết</span>`;
                cssRow = "bg-orange-50/60";
            } else if (m.trangThai === 'DA_TRA_BU_KHOP') {
                trangThaiHTML = `<span class="text-teal-800 font-extrabold">✔ Bù/Trả khớp (${m.chenhLech > 0 ? '+' + m.chenhLech : m.chenhLech})</span>`;
                cssRow = "bg-teal-50/60";
            } else if (m.trangThai === 'DAY_TIET') {
                trangThaiHTML = `<span class="text-blue-700 font-extrabold">📘 Đẩy +${m.chenhLech} tiết</span>`;
                cssRow = "bg-blue-50/50";
            }

            let htmlNoTruoc = m.noDuTruoc === 0
                ? `<span class="text-slate-400">0</span>`
                : `<span class="${m.noDuTruoc < 0 ? 'text-red-700' : 'text-purple-700'} font-extrabold">${m.noDuTruoc > 0 ? 'Dư +' + m.noDuTruoc : 'Nợ ' + Math.abs(m.noDuTruoc)}</span><div class="text-[10px] text-slate-500">${m.lichSuTuan}</div>`;

            let htmlLuyKeSau = m.soDuSauTuanNay === 0
                ? `<span class="text-emerald-700 font-bold">✔ Cân bằng (0)</span>`
                : `<span class="${m.soDuSauTuanNay < 0 ? 'text-red-600' : 'text-purple-700'} font-extrabold">${m.soDuSauTuanNay > 0 ? 'Dư +' + m.soDuSauTuanNay : 'Thiếu ' + Math.abs(m.soDuSauTuanNay)}</span>`;

            htmlKetQua += `<tr class="${cssRow} hover:bg-gray-50 border-b border-gray-300">`;
            if (index === 0) {
                htmlKetQua += `<td rowspan="${dsMonRender.length}" class="border-r border-gray-400 p-2 font-extrabold bg-gray-50 align-middle text-base">${lop}</td>`;
            }

            htmlKetQua += `
                <td class="border-r border-gray-300 p-2 font-semibold text-blue-900 text-left pl-3">${m.mon}</td>
                <td class="border-r border-gray-300 p-2 font-bold text-gray-700">${m.chuan}</td>
                <td class="border-r border-gray-300 p-2 font-extrabold text-blue-700 text-base">${m.daXep}</td>
                <td class="border-r border-gray-300 p-2">${trangThaiHTML}</td>
                <td class="border-r border-gray-300 p-2">${htmlNoTruoc}</td>
                <td class="border-r border-gray-300 p-2">${htmlLuyKeSau}</td>`;

            if (index === 0) {
                htmlKetQua += `
                    <td rowspan="${dsMonRender.length}" class="p-2.5 align-middle bg-slate-50 border-l border-gray-400">
                        <div class="text-xs text-gray-700 font-bold border-b border-gray-300 pb-1 mb-1">
                            Chuẩn: <span class="text-blue-700 text-base">${kqLop.tongChuan}</span> |
                            Đã xếp: <span class="${(kqLop.hoanHao || kqLop.daCanBangLuyKe) ? 'text-emerald-700' : 'text-rose-600'} text-base">${kqLop.tongDaXep}</span>
                        </div>
                        ${tomTatHoanHao}
                        ${tomTatTraKhop}
                        ${tomTatThieu}
                        ${tomTatThua}
                        ${tomTatDay}
                    </td>`;
            }
            htmlKetQua += `</tr>`;
        });
    });

    htmlKetQua += `
        <tr class="bg-gray-200 text-gray-900 font-extrabold border-t-2 border-gray-500">
            <td colspan="7" class="border-r border-gray-400 p-3 text-right uppercase">Tổng số tiết toàn trường trong Tuần ${tuanDangXem}:</td>
            <td class="p-3 leading-tight whitespace-nowrap text-left pl-4">
                <div class="text-sm text-gray-700 mb-1">Chuẩn: <span class="text-2xl text-blue-700 ml-2">${tongTatCaTietChuan}</span></div>
                <div class="text-sm text-gray-700">Đã xếp: <span class="text-2xl text-red-600 ml-2">${tongTatCaTietUI}</span></div>
            </td>
        </tr></tbody></table></div>`;

    document.getElementById('noiDungKiemTra').innerHTML = htmlKetQua;
    document.getElementById('modalKiemTra').classList.remove('hidden');
    if (typeof window.khoaNutThaoTacTKB === 'function') window.khoaNutThaoTacTKB(false);
};

// -------------------------------------------------------------------------
// HÀM 8: Chốt chặn kiểm tra trước khi Lưu (Nhận diện tự động Bù/Trả tiết)
// -------------------------------------------------------------------------
window.kiemTraTruocKhiLuuTKB = function(loaiLuu) {
    const ketQua = window.phanTichChiTietDinhMucTungMon();
    let dsCanhBao = [];
    let dsDaTraKhop = [];

    Object.keys(ketQua).forEach(lop => {
        let kq = ketQua[lop];
        if (loaiLuu === 'codinh') {
            let thieuCoDinh = Object.values(kq.chiTietTungMon).filter(m => m.chenhLech < 0);
            let thuaCoDinh = Object.values(kq.chiTietTungMon).filter(m => m.chenhLech > 0);
            if (thieuCoDinh.length > 0 || thuaCoDinh.length > 0) {
                let pThieu = thieuCoDinh.length > 0 ? `Thiếu [${thieuCoDinh.map(x => `${x.mon}: ${x.chenhLech}`).join(', ')}]` : '';
                let pThua = thuaCoDinh.length > 0 ? `Thừa [${thuaCoDinh.map(x => `${x.mon}: +${x.chenhLech}`).join(', ')}]` : '';
                dsCanhBao.push(`• Lớp ${lop} (${kq.tongDaXep}/${kq.tongChuan} tiết): ${[pThieu, pThua].filter(Boolean).join(' | ')}`);
            }
        } else {
            if (kq.dsMonDaTraBuKhop.length > 0 && kq.dsMonThieu.length === 0 && kq.dsMonThua.length === 0) {
                dsDaTraKhop.push(`✔ Lớp ${lop}: Đã bù/trả khớp [${kq.dsMonDaTraBuKhop.map(x => `${x.mon} (${x.chenhLech > 0 ? '+' + x.chenhLech : x.chenhLech})`).join(', ')}]`);
            } else if (kq.dsMonThieu.length > 0 || kq.dsMonThua.length > 0) {
                let phanThieu = kq.dsMonThieu.length > 0
                    ? `Thiếu/Giảm [${kq.dsMonThieu.map(x => `${x.mon}: -${x.soThieu}`).join(', ')}]`
                    : '';
                let phanThua = kq.dsMonThua.length > 0
                    ? `Thừa/Tăng [${kq.dsMonThua.map(x => `${x.mon}: +${x.soThua}`).join(', ')}]`
                    : '';
                dsCanhBao.push(`• Lớp ${lop} (${kq.tongDaXep}/${kq.tongChuan} tiết): ${[phanThieu, phanThua].filter(Boolean).join(' | ')}`);
            }
        }
    });

    if (dsCanhBao.length > 0) {
        let tieuDe = loaiLuu === 'codinh'
            ? `⚠️ CẢNH BÁO ĐỊNH MỨC TRƯỚC KHI LƯU TKB CỐ ĐỊNH:`
            : `⚠️ ĐỐI SOÁT ĐỊNH MỨC & SỔ CÁI BÙ/TRẢ TIẾT (TUẦN ${tuanDangXem}):`;

        let noiDung = `${tieuDe}\nHiện có ${dsCanhBao.length} lớp lệch định mức môn học:\n\n` +
            dsCanhBao.slice(0, 12).join('\n') +
            (dsCanhBao.length > 12 ? `\n... và ${dsCanhBao.length - 12} lớp khác.` : '') +
            (dsDaTraKhop.length > 0 ? `\n\nCác lớp đã Bù/Trả khớp lũy kế tuần trước:\n${dsDaTraKhop.slice(0, 5).join('\n')}` : '') +
            `\n\n💡 HƯỚNG XỬ LÝ:\n` +
            `• Nếu do xếp sót: Bấm [Cancel / Hủy] để quay lại xếp tiếp (có thể bấm nút môn đỏ ở thanh dưới đáy màn hình để điền nhanh).\n` +
            `• Nếu là DẠY ĐẨY TIẾT hoặc DẠY THẾ TIẾT (tuần sau trả/nghỉ bù): Bấm [OK] để lưu và ghi vào Sổ cái theo dõi liên tuần.`;

        return confirm(noiDung);
    }
    return true;
};

// -------------------------------------------------------------------------
// KHỐI KÍCH HOẠT TỰ ĐỘNG (HOOK AN TOÀN VÀO HỆ THỐNG GỐC)
// -------------------------------------------------------------------------
(function kichHoatHeThongKiemToanTKB_HopNhat() {
    const xuatMaTranGoc = window.xuatMaTranBang;
    if (typeof xuatMaTranGoc === 'function' && !window._daHookKiemToanChiTietMon) {
        window._daHookKiemToanChiTietMon = true;
        window.xuatMaTranBang = function(danhSachTiet) {
            xuatMaTranGoc.apply(this, arguments);
            setTimeout(() => {
                const cacOMon = document.querySelectorAll('input[id^="mon_"]');
                cacOMon.forEach(oMon => {
                    let parts = oMon.id.split('_');
                    if (parts.length >= 5) {
                        window.veNhanDayTheTietTrenO(parts[1], parts[2], parts[3], parts.slice(4).join('_'));
                    }
                });
                window.capNhatCanhBaoChiTietMonTrenLuoi();
            }, 80);
        };
    }

    const luuDuLieuGoc = window.luuDuLieu;
    if (typeof luuDuLieuGoc === 'function' && !window._daHookLuuKiemToanMon) {
        window._daHookLuuKiemToanMon = true;
        window.luuDuLieu = async function(event, loaiLuu, tuDongLuu = false) {
            if (!tuDongLuu && (loaiLuu === 'tuan' || loaiLuu === 'codinh')) {
                if (!window.kiemTraTruocKhiLuuTKB(loaiLuu)) return;
            }
            return await luuDuLieuGoc.apply(this, arguments);
        };
    }

    const luuSuaGoc = window.luuSuaCucBoTKB;
    if (typeof luuSuaGoc === 'function' && !window._daHookLuuSuaKiemToanMon) {
        window._daHookLuuSuaKiemToanMon = true;
        window.luuSuaCucBoTKB = async function(event) {
            if (!window.kiemTraTruocKhiLuuTKB('sua')) return;
            return await luuSuaGoc.apply(this, arguments);
        };
    }

    document.addEventListener('change', function(e) {
        if (e.target && e.target.id && e.target.id.startsWith('mon_')) {
            let parts = e.target.id.split('_');
            let lop = parts.length >= 5 ? parts.slice(4).join('_') : null;
            window.capNhatCanhBaoChiTietMonTrenLuoi(lop);
            setTimeout(() => window.hienThiGoiYMonConThieuKhiFocus(e.target), 120);
        }
    });

    document.addEventListener('focusin', function(e) {
        if (e.target && e.target.id && e.target.id.startsWith('mon_')) {
            window.hienThiGoiYMonConThieuKhiFocus(e.target);
        }
    });

    document.addEventListener('click', function(e) {
        if (e.altKey && e.target && e.target.id && (e.target.id.startsWith('mon_') || e.target.id.startsWith('gv_'))) {
            e.preventDefault();
            e.stopPropagation();
            let parts = e.target.id.split('_');
            if (parts.length >= 5) {
                window.chuyenDoiCheDoDayTheTiet(parts[1], parts[2], parts[3], parts.slice(4).join('_'));
            }
        }
    }, true);
})();
