// =========================================================================
// MODULE: TỔNG HỢP SĨ SỐ & THEO DÕI HỌC SINH NGHỈ THEO NĂM HỌC VÀ TUẦN (TongHopSiSo.js)
// Tự chủ nạp dữ liệu từ DATA_TKB / TKB_HIEN_TAI / SO_DAU_BAI / DIEM_DANH_SDB
// =========================================================================

let trangThaiTongHopSiSo = {
    namHocChon: '',
    tuanChon: '',
    khoiChon: 'ALL',
    lopChon: 'ALL',
    chiHienCoVang: false,
    ketQuaHienTai: null
};

let cacheNguonTongHopSiSo = null;
let dangTaiNguonTongHopSiSo = false;

function layNamHocMacDinhTHSS() {
    if (typeof namHocHeThongSDB !== 'undefined' && namHocHeThongSDB) return String(namHocHeThongSDB).trim();
    if (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu && window.thongSoHocVu.NAM_HOC) {
        return String(window.thongSoHocVu.NAM_HOC).trim();
    }
    if (typeof thongSoHocVu !== 'undefined' && thongSoHocVu && thongSoHocVu.NAM_HOC) {
        return String(thongSoHocVu.NAM_HOC).trim();
    }
    let now = new Date();
    let y = now.getFullYear();
    return (now.getMonth() + 1 >= 8) ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function xacDinhNamHocTuNgayTHSS(ngayStr) {
    if (!ngayStr) return '';
    let m = String(ngayStr).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (!m) return '';
    let thang = parseInt(m[2], 10);
    let nam = parseInt(m[3], 10);
    return (thang >= 8) ? `${nam}-${nam + 1}` : `${nam - 1}-${nam}`;
}

// 1. Khởi tạo & tự động nạp dữ liệu (từ RAM nếu đã có, hoặc gọi trực tiếp API máy chủ)
window.khoiTaoTongHopSiSo = async function(containerId = 'vungHienThiTongHopSiSo') {
    let container = document.getElementById(containerId);
    if (!container) return;

    let coDuLieuTrongRam = (typeof duLieuTKBGopDaMap !== 'undefined' && Array.isArray(duLieuTKBGopDaMap) && duLieuTKBGopDaMap.length > 0);
    if (coDuLieuTrongRam) {
        veGiaoDienTongHopSiSo(containerId);
        return;
    }

    if (cacheNguonTongHopSiSo && Array.isArray(cacheNguonTongHopSiSo.tkbRows) && cacheNguonTongHopSiSo.tkbRows.length > 0) {
        veGiaoDienTongHopSiSo(containerId);
        return;
    }

    if (dangTaiNguonTongHopSiSo) return;
    dangTaiNguonTongHopSiSo = true;

    container.innerHTML = `<div class="text-center py-12 text-slate-500 font-bold">
        <div class="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-base text-blue-900 font-extrabold">Đang tải dữ liệu Năm học &amp; Tuần từ DATA_TKB...</p>
    </div>`;

    try {
        // Nếu Sổ đầu bài đang tải ngầm thì chờ tối đa 6 giây xem xong chưa, nếu chưa thì gọi API trực tiếp
        if (typeof dangTaiDuLieuSoDauBai !== 'undefined' && dangTaiDuLieuSoDauBai === true) {
            for (let w = 0; w < 24; w++) {
                await new Promise(r => setTimeout(r, 250));
                if (typeof duLieuTKBGopDaMap !== 'undefined' && Array.isArray(duLieuTKBGopDaMap) && duLieuTKBGopDaMap.length > 0) {
                    break;
                }
            }
        }

        if (typeof duLieuTKBGopDaMap === 'undefined' || !Array.isArray(duLieuTKBGopDaMap) || duLieuTKBGopDaMap.length === 0) {
            if (typeof CAU_HINH_FRONTEND !== 'undefined' && CAU_HINH_FRONTEND.URL_API_MAY_CHU) {
                let dinhDanh = (typeof window.dinhDanhGiaoVienToanCuc !== 'undefined' && window.dinhDanhGiaoVienToanCuc)
                    ? String(window.dinhDanhGiaoVienToanCuc).trim()
                    : '';
                let url = `${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDuLieuSoDauBai&emailTruyCap=${encodeURIComponent(dinhDanh)}&taiToanBo=true`;
                const phanHoi = await (typeof fetchVoiCoCheThuLai === 'function' ? fetchVoiCoCheThuLai(url, {}, 3, 60000) : fetch(url));
                const duLieuSever = await phanHoi.json();

                if (duLieuSever && duLieuSever.trangThai !== 'loi_he_thong') {
                    // Đồng bộ luôn sang Sổ đầu bài nếu hàm khoiTaoDuLieuSoDauBai có sẵn
                    if (typeof khoiTaoDuLieuSoDauBai === 'function') {
                        khoiTaoDuLieuSoDauBai(duLieuSever);
                    }
                    cacheNguonTongHopSiSo = trichXuatNguonTuServerTHSS(duLieuSever);
                }
            }
        }
    } catch (loi) {
        container.innerHTML = `<div class="text-center py-10 text-red-600 font-bold">⚠️ Lỗi tải dữ liệu sĩ số: ${loi.message}</div>`;
        dangTaiNguonTongHopSiSo = false;
        return;
    }

    dangTaiNguonTongHopSiSo = false;
    veGiaoDienTongHopSiSo(containerId);
};

function trichXuatNguonTuServerTHSS(duLieuSever) {
    let nhMacDinh = duLieuSever.NAM_HOC || layNamHocMacDinhTHSS();
    let tkbRows = [];
    const chuanHoaThu = (thuStr) => {
        if (!thuStr) return '';
        let raw = String(thuStr).trim().toLowerCase();
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    };

    let mapSlot = {};
    const napTkb = (arr) => {
        if (!Array.isArray(arr)) return;
        arr.forEach(d => {
            let t = parseInt(String(d['C'] || '').replace(/\D/g, ''), 10) || 0;
            let lop = String(d['G'] || '').trim().toUpperCase();
            let thu = chuanHoaThu(d['D'] || '');
            let buoi = String(d['E'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều';
            let tiet = String(d['F'] || '').trim();
            let ngay = String(d['K'] || '').trim();
            if (!t || !lop || !thu || !tiet) return;
            let nh = xacDinhNamHocTuNgayTHSS(ngay) || nhMacDinh;
            mapSlot[`${nh}_${t}_${lop}_${thu}_${buoi}_${tiet}`] = {
                'Năm học': nh,
                'Tuần': String(t),
                'Mã Lớp': lop,
                'Thứ': thu,
                'Buổi': buoi,
                'Tiết': tiet,
                'Ngày': ngay,
                'Môn Học': d['H'] || '',
                'ChuyenCan_Thuc': ''
            };
        });
    };
    napTkb(duLieuSever.DATA_TKB);
    napTkb(duLieuSever.TKB_HIEN_TAI);

    if (Array.isArray(duLieuSever.SO_DAU_BAI)) {
        duLieuSever.SO_DAU_BAI.forEach(d => {
            let ma = String(d['A'] || '').trim();
            let t = parseInt(String(d['B'] || '').replace(/\D/g, ''), 10) || 0;
            let lop = String(d['C'] || '').trim().toUpperCase();
            let thu = chuanHoaThu(d['D'] || '');
            if (!t || !lop || !thu || thu.toUpperCase() === 'TONGHOP' || thu.toUpperCase() === 'TỔNG HỢP') return;
            let buoi = String(d['F'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều';
            let tiet = String(d['G'] || '').trim();
            let ngay = String(d['E'] || '').trim();
            let mNH = ma.match(/^(\d{4}-\d{4})_/);
            let nh = mNH ? mNH[1] : (xacDinhNamHocTuNgayTHSS(ngay) || nhMacDinh);
            let k = `${nh}_${t}_${lop}_${thu}_${buoi}_${tiet}`;
            if (!mapSlot[k]) {
                mapSlot[k] = {
                    'Năm học': nh, 'Tuần': String(t), 'Mã Lớp': lop, 'Thứ': thu, 'Buổi': buoi, 'Tiết': tiet, 'Ngày': ngay, 'Môn Học': d['H'] || ''
                };
            }
            mapSlot[k]['ChuyenCan_Thuc'] = d['N'] || '';
        });
    }
    tkbRows = Object.values(mapSlot);

    return {
        namHocMacDinh: nhMacDinh,
        tkbRows: tkbRows,
        diemDanhMap: duLieuSever.DIEM_DANH_SDB || {},
        siSoMap: duLieuSever.SI_SO_THEO_LOP || {}
    };
}

// 2. Lấy nguồn dữ liệu hợp nhất (Ưu tiên duLieuTKBGopDaMap nếu đã nạp, kết hợp cacheNguonTongHopSiSo)
function layNguonHopNhatTHSS() {
    let nhMacDinh = layNamHocMacDinhTHSS();
    let rows = [];
    if (typeof duLieuTKBGopDaMap !== 'undefined' && Array.isArray(duLieuTKBGopDaMap) && duLieuTKBGopDaMap.length > 0) {
        rows = duLieuTKBGopDaMap;
    } else if (cacheNguonTongHopSiSo && Array.isArray(cacheNguonTongHopSiSo.tkbRows)) {
        rows = cacheNguonTongHopSiSo.tkbRows;
    }
    let ddMap = (window.duLieuDiemDanhSDB && Object.keys(window.duLieuDiemDanhSDB).length > 0)
        ? window.duLieuDiemDanhSDB
        : (cacheNguonTongHopSiSo ? cacheNguonTongHopSiSo.diemDanhMap : {});

    return { nhMacDinh, rows, ddMap };
}

function layDanhSachNamHocTHSS() {
    let { nhMacDinh, rows } = layNguonHopNhatTHSS();
    let tapNH = new Set();
    if (nhMacDinh) tapNH.add(nhMacDinh);
    rows.forEach(d => {
        let nh = d['Năm học'] || xacDinhNamHocTuNgayTHSS(d['Ngày']);
        if (nh) tapNH.add(nh);
    });
    return Array.from(tapNH).sort((a, b) => b.localeCompare(a));
}

function layDanhSachTuanTheoNamHocTHSS(namHocLoc) {
    let { nhMacDinh, rows, ddMap } = layNguonHopNhatTHSS();
    let tapTuan = new Set();

    rows.forEach(d => {
        let nhDong = d['Năm học'] || xacDinhNamHocTuNgayTHSS(d['Ngày']) || nhMacDinh;
        if (namHocLoc && nhDong && nhDong !== namHocLoc) return;
        let t = parseInt(String(d['Tuần'] || '').replace(/\D/g, ''), 10) || 0;
        if (t > 0) tapTuan.add(t);
    });

    if (ddMap && (!namHocLoc || namHocLoc === nhMacDinh)) {
        Object.keys(ddMap).forEach(k => {
            let t = parseInt(String(k.split('_')[0] || '').replace(/\D/g, ''), 10) || 0;
            if (t > 0) tapTuan.add(t);
        });
    }

    return Array.from(tapTuan).sort((a, b) => b - a);
}

function layDanhSachLopTongHopSS(tuanSo, namHocLoc) {
    let { nhMacDinh, rows } = layNguonHopNhatTHSS();
    let tapLop = new Set();
    let nguonHV = (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu)
        ? window.thongSoHocVu
        : ((typeof thongSoHocVu !== 'undefined' && thongSoHocVu) ? thongSoHocVu : null);

    if (nguonHV && Array.isArray(nguonHV.DANH_SACH_LOP)) {
        nguonHV.DANH_SACH_LOP.forEach(l => {
            let v = String(l || '').trim().toUpperCase();
            if (v) tapLop.add(v);
        });
    }
    rows.forEach(d => {
        let nhDong = d['Năm học'] || xacDinhNamHocTuNgayTHSS(d['Ngày']) || nhMacDinh;
        if (namHocLoc && nhDong && nhDong !== namHocLoc) return;
        let t = parseInt(String(d['Tuần'] || '').replace(/\D/g, ''), 10) || 0;
        let l = String(d['Mã Lớp'] || '').trim().toUpperCase();
        if (l && (!tuanSo || t === tuanSo)) tapLop.add(l);
    });
    return Array.from(tapLop).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

function laySiSoChuanTongHopSS(maLop) {
    let lopUp = String(maLop || '').trim().toUpperCase();
    if (typeof window.laySiSoChuanCuaLopSDB === 'function') {
        let ss = window.laySiSoChuanCuaLopSDB(lopUp);
        if (ss > 0) return ss;
    }
    if (cacheNguonTongHopSiSo && cacheNguonTongHopSiSo.siSoMap && cacheNguonTongHopSiSo.siSoMap[lopUp]) {
        return parseInt(cacheNguonTongHopSiSo.siSoMap[lopUp], 10) || 0;
    }
    let nguonHV = (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu)
        ? window.thongSoHocVu
        : ((typeof thongSoHocVu !== 'undefined' && thongSoHocVu) ? thongSoHocVu : null);
    if (nguonHV && nguonHV.SI_SO_THEO_LOP && nguonHV.SI_SO_THEO_LOP[lopUp]) {
        return parseInt(nguonHV.SI_SO_THEO_LOP[lopUp], 10) || 0;
    }
    return 0;
}

// 3. Thuật toán lõi: Tổng hợp sĩ số theo Năm học -> Tuần -> Các ngày trong tuần -> Từng học sinh nghỉ
window.tinhToanTongHopSiSoTuan = function(tuanSo, khoiLoc = 'ALL', lopLoc = 'ALL', namHocLoc = '') {
    let { nhMacDinh, rows, ddMap } = layNguonHopNhatTHSS();
    if (!namHocLoc) namHocLoc = nhMacDinh;

    let dsLop = layDanhSachLopTongHopSS(tuanSo, namHocLoc).filter(lop => {
        if (lopLoc !== 'ALL' && lop !== lopLoc) return false;
        if (khoiLoc !== 'ALL') {
            let m = lop.match(/^\d+/) || lop.match(/\d+/);
            let k = m ? m[0] : '';
            if (k !== khoiLoc) return false;
        }
        return true;
    });

    const dsThuChuan = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
    let coThu7 = false, coChuNhat = false;
    let mapNgayTheoThu = {};

    // Tạo chỉ mục nhanh theo tuần & năm học để tra cứu O(1)
    let indexTuanRows = {};
    rows.forEach(d => {
        let t = parseInt(String(d['Tuần'] || '').replace(/\D/g, ''), 10) || 0;
        if (t !== tuanSo) return;
        let nhDong = d['Năm học'] || xacDinhNamHocTuNgayTHSS(d['Ngày']) || nhMacDinh;
        if (namHocLoc && nhDong && nhDong !== namHocLoc) return;

        let rawThu = String(d['Thứ'] || '').trim().toLowerCase();
        let thu = rawThu ? (rawThu.charAt(0).toUpperCase() + rawThu.slice(1)) : '';
        if (thu === 'Thứ 7') coThu7 = true;
        if (thu === 'Chủ nhật') coChuNhat = true;
        let ngay = String(d['Ngày'] || '').trim();
        if (thu && ngay && ngay !== '...' && !mapNgayTheoThu[thu]) {
            mapNgayTheoThu[thu] = ngay;
        }

        let lop = String(d['Mã Lớp'] || '').trim().toUpperCase();
        let buoi = String(d['Buổi'] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều';
        let tiet = String(d['Tiết'] || '').trim();
        if (lop && thu && tiet) {
            indexTuanRows[`${lop}_${thu}_${buoi}_${tiet}`] = d;
        }
    });

    let dsThuHienThi = [...dsThuChuan];
    if (coThu7) dsThuHienThi.push('Thứ 7');
    if (coChuNhat) dsThuHienThi.push('Chủ nhật');

    let ketQuaTheoLop = [];
    let mapHocSinhNghiTuan = {};
    let tongSiSoToanPhamVi = 0;
    let tongLuotVangP = 0;
    let tongLuotVangKP = 0;

    dsLop.forEach(maLop => {
        let siSoChuan = laySiSoChuanTongHopSS(maLop);
        let ngayData = {};
        let tongPLop = 0;
        let tongKPLop = 0;
        let mapHsLop = {};

        dsThuHienThi.forEach(thu => {
            let cacBanGhiTrongNgay = [];
            for (let buoi of ['sáng', 'chiều']) {
                let maxTiet = buoi === 'sáng' ? 5 : 4;
                for (let tiet = 1; tiet <= maxTiet; tiet++) {
                    let khoaSlot = `${tuanSo}_${maLop}_${thu}_${buoi}_${tiet}`;
                    let ct = (ddMap && ddMap[khoaSlot]) ? ddMap[khoaSlot] : null;
                    let dongMap = indexTuanRows[`${maLop}_${thu}_${buoi}_${tiet}`] || null;
                    if (!ct && dongMap && dongMap.ChiTietChuyenCan) {
                        ct = dongMap.ChiTietChuyenCan;
                    }
                    let chuoiCC = dongMap ? String(dongMap['ChuyenCan_Thuc'] || '').trim() : '';

                    if (ct && (parseInt(ct.tongSiSo, 10) || 0) > 0) {
                        cacBanGhiTrongNgay.push({ buoi, tiet, ct, chuoiCC });
                    } else if (chuoiCC !== '') {
                        cacBanGhiTrongNgay.push({ buoi, tiet, ct: null, chuoiCC });
                    }
                }
            }

            if (cacBanGhiTrongNgay.length === 0) {
                ngayData[thu] = { daDiemDanh: false };
                return;
            }

            let maxTongNgay = siSoChuan;
            let minCoMatNgay = null;
            let mapTenP = new Map();
            let mapTenKP = new Map();
            let maxSoKhongTenP = 0;
            let maxSoKhongTenKP = 0;
            let chuoiFallback = '';

            cacBanGhiTrongNgay.forEach(item => {
                let nhanBuoiTiet = `${item.buoi === 'sáng' ? 'S' : 'C'}-T${item.tiet}`;
                if (item.ct) {
                    let tong = parseInt(item.ct.tongSiSo, 10) || 0;
                    if (tong > maxTongNgay) maxTongNgay = tong;
                    let coMat = parseInt(item.ct.coMat, 10);
                    if (!isNaN(coMat)) {
                        minCoMatNgay = (minCoMatNgay === null) ? coMat : Math.min(minCoMatNgay, coMat);
                    }
                    let dsP = Array.isArray(item.ct.dsVangCoPhep) ? item.ct.dsVangCoPhep.filter(Boolean) : [];
                    let dsKP = Array.isArray(item.ct.dsVangKhongPhep) ? item.ct.dsVangKhongPhep.filter(Boolean) : [];
                    let soP = parseInt(item.ct.vangCoPhep, 10) || 0;
                    let soKP = parseInt(item.ct.vangKhongPhep, 10) || 0;

                    if (dsP.length > 0) {
                        dsP.forEach(ten => {
                            let k = ten.trim().toLowerCase().normalize('NFC');
                            if (!mapTenP.has(k)) mapTenP.set(k, { ten: ten.trim(), buoiTiet: [] });
                            mapTenP.get(k).buoiTiet.push(nhanBuoiTiet);
                        });
                    } else if (soP > maxSoKhongTenP) {
                        maxSoKhongTenP = soP;
                    }

                    if (dsKP.length > 0) {
                        dsKP.forEach(ten => {
                            let k = ten.trim().toLowerCase().normalize('NFC');
                            if (!mapTenKP.has(k)) mapTenKP.set(k, { ten: ten.trim(), buoiTiet: [] });
                            mapTenKP.get(k).buoiTiet.push(nhanBuoiTiet);
                        });
                    } else if (soKP > maxSoKhongTenKP) {
                        maxSoKhongTenKP = soKP;
                    }
                } else if (item.chuoiCC) {
                    chuoiFallback = item.chuoiCC;
                }
            });

            if (siSoChuan === 0 && maxTongNgay > 0) siSoChuan = maxTongNgay;

            let soVangPNgay = mapTenP.size > 0 ? mapTenP.size : maxSoKhongTenP;
            let soVangKPNgay = mapTenKP.size > 0 ? mapTenKP.size : maxSoKhongTenKP;
            let coMatHienThi = (maxTongNgay > 0)
                ? Math.max(0, maxTongNgay - soVangPNgay - soVangKPNgay)
                : (minCoMatNgay !== null ? minCoMatNgay : 0);

            tongPLop += soVangPNgay;
            tongKPLop += soVangKPNgay;
            tongLuotVangP += soVangPNgay;
            tongLuotVangKP += soVangKPNgay;

            let ngayStr = mapNgayTheoThu[thu] || '';
            const ghiHs = (mapTen, loaiVang) => {
                mapTen.forEach((info, kTen) => {
                    let keyGlobal = `${maLop}||${kTen}`;
                    if (!mapHocSinhNghiTuan[keyGlobal]) {
                        mapHocSinhNghiTuan[keyGlobal] = { ten: info.ten, lop: maLop, ngayMap: new Map() };
                    }
                    let existingDay = mapHocSinhNghiTuan[keyGlobal].ngayMap.get(thu);
                    if (!existingDay) {
                        mapHocSinhNghiTuan[keyGlobal].ngayMap.set(thu, {
                            thu: thu, ngay: ngayStr, loai: loaiVang, buoiTiet: [...info.buoiTiet]
                        });
                    } else {
                        if (loaiVang === 'KP') existingDay.loai = 'KP';
                        existingDay.buoiTiet.push(...info.buoiTiet);
                    }

                    if (!mapHsLop[kTen]) mapHsLop[kTen] = { ten: info.ten, pDays: new Set(), kpDays: new Set() };
                    if (loaiVang === 'P') mapHsLop[kTen].pDays.add(thu);
                    else mapHsLop[kTen].kpDays.add(thu);
                });
            };
            ghiHs(mapTenP, 'P');
            ghiHs(mapTenKP, 'KP');

            ngayData[thu] = {
                daDiemDanh: true,
                tong: maxTongNgay,
                coMat: coMatHienThi,
                vangP: soVangPNgay,
                vangKP: soVangKPNgay,
                dsTenP: Array.from(mapTenP.values()).map(x => x.ten),
                dsTenKP: Array.from(mapTenKP.values()).map(x => x.ten),
                chuoiFallback: chuoiFallback
            };
        });

        if (siSoChuan > 0) tongSiSoToanPhamVi += siSoChuan;

        let tomTatHsLop = Object.values(mapHsLop).map(h => {
            let parts = [];
            if (h.pDays.size > 0) parts.push(`${h.pDays.size}P`);
            if (h.kpDays.size > 0) parts.push(`${h.kpDays.size}KP`);
            return `${h.ten} (${parts.join(', ')})`;
        });

        ketQuaTheoLop.push({
            maLop: maLop,
            siSoChuan: siSoChuan,
            ngayData: ngayData,
            tongP: tongPLop,
            tongKP: tongKPLop,
            coVang: (tongPLop > 0 || tongKPLop > 0),
            tomTatHsLop: tomTatHsLop
        });
    });

    let dsHocSinhNghi = Object.values(mapHocSinhNghiTuan).map(item => {
        let chiTietNgay = Array.from(item.ngayMap.values());
        let soP = chiTietNgay.filter(d => d.loai === 'P').length;
        let soKP = chiTietNgay.filter(d => d.loai === 'KP').length;
        return {
            ten: item.ten,
            lop: item.lop,
            soNgayNghi: chiTietNgay.length,
            soP: soP,
            soKP: soKP,
            chiTietNgay: chiTietNgay
        };
    }).sort((a, b) => b.soNgayNghi - a.soNgayNghi || a.lop.localeCompare(b.lop, undefined, { numeric: true }));

    let tongLuotCoThe = tongSiSoToanPhamVi * dsThuHienThi.length;
    let tyLeChuyenCan = tongLuotCoThe > 0
        ? (((tongLuotCoThe - tongLuotVangP - tongLuotVangKP) / tongLuotCoThe) * 100).toFixed(1)
        : '100.0';

    return {
        namHoc: namHocLoc,
        tuanSo: tuanSo,
        dsThu: dsThuHienThi,
        mapNgayTheoThu: mapNgayTheoThu,
        ketQuaTheoLop: ketQuaTheoLop,
        dsHocSinhNghi: dsHocSinhNghi,
        tongKet: {
            soLop: ketQuaTheoLop.length,
            tongSiSo: tongSiSoToanPhamVi,
            tongVangP: tongLuotVangP,
            tongVangKP: tongLuotVangKP,
            tongVang: tongLuotVangP + tongLuotVangKP,
            tyLeChuyenCan: tyLeChuyenCan
        }
    };
};

// 4. Kết xuất giao diện Tổng hợp Sĩ số (Chọn Năm học -> Chọn Tuần học từ DATA_TKB)
window.veGiaoDienTongHopSiSo = function(containerId = 'vungHienThiTongHopSiSo') {
    let container = document.getElementById(containerId);
    if (!container) return;

    let dsNamHoc = layDanhSachNamHocTHSS();
    if (!trangThaiTongHopSiSo.namHocChon || !dsNamHoc.includes(trangThaiTongHopSiSo.namHocChon)) {
        trangThaiTongHopSiSo.namHocChon = dsNamHoc[0] || layNamHocMacDinhTHSS();
    }
    let namHocChon = trangThaiTongHopSiSo.namHocChon;

    let dsTuan = layDanhSachTuanTheoNamHocTHSS(namHocChon);
    if (!trangThaiTongHopSiSo.tuanChon || !dsTuan.includes(Number(trangThaiTongHopSiSo.tuanChon))) {
        let tuanHeThong = (typeof window.thongSoHocVu !== 'undefined' && window.thongSoHocVu && window.thongSoHocVu.TUAN_HIEN_TAI)
            ? parseInt(window.thongSoHocVu.TUAN_HIEN_TAI, 10)
            : (dsTuan[0] || 0);
        trangThaiTongHopSiSo.tuanChon = dsTuan.includes(tuanHeThong) ? tuanHeThong : (dsTuan[0] || 0);
    }

    let tuanSo = parseInt(trangThaiTongHopSiSo.tuanChon, 10) || 0;
    let dsTatCaLop = tuanSo > 0 ? layDanhSachLopTongHopSS(tuanSo, namHocChon) : [];
    let tapKhoi = new Set();
    dsTatCaLop.forEach(l => {
        let m = l.match(/^\d+/) || l.match(/\d+/);
        if (m) tapKhoi.add(m[0]);
    });
    let dsKhoi = Array.from(tapKhoi).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    let htmlBoLoc = `
        <div class="bg-white border border-slate-200 rounded-lg p-3 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3">
                <div class="flex items-center gap-1.5">
                    <label class="text-xs font-bold text-slate-700">Năm học:</label>
                    <select onchange="trangThaiTongHopSiSo.namHocChon=this.value; trangThaiTongHopSiSo.tuanChon=''; veGiaoDienTongHopSiSo('${containerId}')" class="px-2.5 py-1.5 text-xs font-extrabold text-blue-900 border border-blue-300 rounded bg-blue-50 outline-none focus:border-blue-500 cursor-pointer">
                        ${dsNamHoc.map(nh => `<option value="${nh}" ${nh === namHocChon ? 'selected' : ''}>${nh}</option>`).join('')}
                    </select>
                </div>
                <div class="flex items-center gap-1.5">
                    <label class="text-xs font-bold text-slate-700">Tuần học:</label>
                    <select onchange="trangThaiTongHopSiSo.tuanChon=this.value; veGiaoDienTongHopSiSo('${containerId}')" class="px-2.5 py-1.5 text-xs font-extrabold text-blue-900 border border-blue-300 rounded bg-blue-50 outline-none focus:border-blue-500 cursor-pointer">
                        ${dsTuan.length === 0 ? `<option value="">Chưa có dữ liệu tuần</option>` : dsTuan.map(t => `<option value="${t}" ${t === tuanSo ? 'selected' : ''}>Tuần ${t}</option>`).join('')}
                    </select>
                </div>
                <div class="flex items-center gap-1.5">
                    <label class="text-xs font-bold text-slate-700">Khối:</label>
                    <select onchange="trangThaiTongHopSiSo.khoiChon=this.value; trangThaiTongHopSiSo.lopChon='ALL'; veGiaoDienTongHopSiSo('${containerId}')" class="px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 rounded bg-white outline-none cursor-pointer">
                        <option value="ALL" ${trangThaiTongHopSiSo.khoiChon === 'ALL' ? 'selected' : ''}>Tất cả khối</option>
                        ${dsKhoi.map(k => `<option value="${k}" ${trangThaiTongHopSiSo.khoiChon === k ? 'selected' : ''}>Khối ${k}</option>`).join('')}
                    </select>
                </div>
                <div class="flex items-center gap-1.5">
                    <label class="text-xs font-bold text-slate-700">Lớp:</label>
                    <select onchange="trangThaiTongHopSiSo.lopChon=this.value; veGiaoDienTongHopSiSo('${containerId}')" class="px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 rounded bg-white outline-none cursor-pointer">
                        <option value="ALL" ${trangThaiTongHopSiSo.lopChon === 'ALL' ? 'selected' : ''}>Tất cả lớp</option>
                        ${dsTatCaLop.map(l => `<option value="${l}" ${trangThaiTongHopSiSo.lopChon === l ? 'selected' : ''}>Lớp ${l}</option>`).join('')}
                    </select>
                </div>
                <label class="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 cursor-pointer select-none bg-rose-50 px-2.5 py-1.5 rounded border border-rose-200">
                    <input type="checkbox" ${trangThaiTongHopSiSo.chiHienCoVang ? 'checked' : ''} onchange="trangThaiTongHopSiSo.chiHienCoVang=this.checked; veGiaoDienTongHopSiSo('${containerId}')" class="accent-rose-600">
                    <span>Chỉ hiện lớp có HS nghỉ</span>
                </label>
            </div>
            <button type="button" onclick="xuatExcelTongHopSiSo()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 text-xs rounded shadow flex items-center gap-1.5 cursor-pointer">
                <span>📥 Xuất Excel Tổng hợp ${tuanSo ? 'Tuần ' + tuanSo : ''}</span>
            </button>
        </div>
    `;

    if (tuanSo === 0) {
        container.innerHTML = htmlBoLoc + `<div class="text-center py-12 text-slate-500 font-bold bg-slate-50 border border-slate-200 rounded-lg">Năm học ${namHocChon} chưa có dữ liệu tuần học trong DATA_TKB / Sổ đầu bài.</div>`;
        return;
    }

    let kq = window.tinhToanTongHopSiSoTuan(tuanSo, trangThaiTongHopSiSo.khoiChon, trangThaiTongHopSiSo.lopChon, namHocChon);
    trangThaiTongHopSiSo.ketQuaHienTai = kq;

    let dsLopHienThi = trangThaiTongHopSiSo.chiHienCoVang
        ? kq.ketQuaTheoLop.filter(x => x.coVang)
        : kq.ketQuaTheoLop;

    let htmlKPI = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="text-xs font-bold text-blue-800 uppercase">Tổng sĩ số (${kq.tongKet.soLop} lớp)</div>
                <div class="text-2xl font-black text-blue-900 mt-1">${kq.tongKet.tongSiSo} <span class="text-xs font-semibold">học sinh</span></div>
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div class="text-xs font-bold text-amber-800 uppercase">Lượt nghỉ có phép (P)</div>
                <div class="text-2xl font-black text-amber-700 mt-1">${kq.tongKet.tongVangP} <span class="text-xs font-semibold">lượt ngày</span></div>
            </div>
            <div class="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <div class="text-xs font-bold text-rose-800 uppercase">Lượt nghỉ không phép (KP)</div>
                <div class="text-2xl font-black text-rose-700 mt-1">${kq.tongKet.tongVangKP} <span class="text-xs font-semibold">lượt ngày</span></div>
            </div>
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div class="text-xs font-bold text-emerald-800 uppercase">Tỷ lệ chuyên cần tuần</div>
                <div class="text-2xl font-black text-emerald-700 mt-1">${kq.tongKet.tyLeChuyenCan}%</div>
            </div>
        </div>
    `;

    let htmlBangMaTran = `
        <div class="bg-white border border-slate-300 rounded-lg shadow-sm overflow-x-auto mb-6">
            <div class="px-4 py-2.5 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
                <span class="font-extrabold text-sm text-slate-800 uppercase">Bảng tổng hợp sĩ số theo ngày — Năm học ${namHocChon} — Tuần ${tuanSo}</span>
                <span class="text-xs text-slate-500 italic">Tự động gom trùng tên học sinh nghỉ trong cùng một ngày</span>
            </div>
            <table class="w-full min-w-[920px] border-collapse text-xs">
                <thead class="bg-slate-50 text-slate-800 font-bold text-center">
                    <tr>
                        <th class="border border-slate-300 p-2 w-10">STT</th>
                        <th class="border border-slate-300 p-2 w-24">LỚP (SĨ SỐ)</th>
                        ${kq.dsThu.map(thu => {
                            let ngay = kq.mapNgayTheoThu[thu] || '';
                            return `<th class="border border-slate-300 p-2 min-w-[130px]">${thu}${ngay ? `<br><span class="font-normal text-[11px] text-slate-500">${ngay}</span>` : ''}</th>`;
                        }).join('')}
                        <th class="border border-slate-300 p-2 min-w-[180px]">TỔNG HỢP TUẦN</th>
                    </tr>
                </thead>
                <tbody>
                    ${dsLopHienThi.length === 0 ? `<tr><td colspan="${kq.dsThu.length + 3}" class="text-center py-8 text-slate-500 italic font-semibold">Không có dữ liệu phù hợp với bộ lọc.</td></tr>` : dsLopHienThi.map((row, idx) => `
                        <tr class="hover:bg-slate-50">
                            <td class="border border-slate-300 p-2 text-center font-bold text-slate-500">${idx + 1}</td>
                            <td class="border border-slate-300 p-2 text-center font-extrabold text-blue-900">${row.maLop}<br><span class="text-[11px] font-semibold text-slate-500">(${row.siSoChuan || '--'} HS)</span></td>
                            ${kq.dsThu.map(thu => {
                                let cell = row.ngayData[thu];
                                if (!cell || !cell.daDiemDanh) {
                                    return `<td class="border border-slate-300 p-2 text-center text-slate-400">--</td>`;
                                }
                                if (cell.chuoiFallback && cell.tong === 0) {
                                    return `<td class="border border-slate-300 p-2 text-center font-bold text-slate-700">${cell.chuoiFallback}</td>`;
                                }
                                if (cell.vangP === 0 && cell.vangKP === 0) {
                                    return `<td class="border border-slate-300 p-2 text-center bg-emerald-50/40"><span class="font-bold text-emerald-700">${cell.coMat}/${cell.tong}</span><span class="block text-[10px] text-emerald-600">Đủ</span></td>`;
                                }
                                let dsTenHtml = [];
                                if (cell.dsTenP.length > 0) dsTenHtml.push(`<span class="text-amber-800"><b>P:</b> ${cell.dsTenP.join(', ')}</span>`);
                                if (cell.dsTenKP.length > 0) dsTenHtml.push(`<span class="text-rose-700"><b>KP:</b> ${cell.dsTenKP.join(', ')}</span>`);
                                return `<td class="border border-slate-300 p-1.5 text-center bg-rose-50/40 align-top">
                                    <div class="font-extrabold text-rose-700">${cell.coMat}/${cell.tong} <span class="text-[10.5px] font-semibold">(P:${cell.vangP}, KP:${cell.vangKP})</span></div>
                                    ${dsTenHtml.length > 0 ? `<div class="text-[11px] text-left mt-1 leading-snug">${dsTenHtml.join('<br>')}</div>` : ''}
                                </td>`;
                            }).join('')}
                            <td class="border border-slate-300 p-2 text-left align-top">
                                <div class="font-bold ${row.coVang ? 'text-rose-700' : 'text-emerald-700'}">
                                    ${row.coVang ? `Nghỉ: ${row.tongP}P, ${row.tongKP}KP` : 'Chuyên cần 100%'}
                                </div>
                                ${row.tomTatHsLop.length > 0 ? `<div class="text-[11px] text-slate-700 mt-1 leading-snug">${row.tomTatHsLop.join('; ')}</div>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    let htmlBangHocSinh = `
        <div class="bg-white border border-slate-300 rounded-lg shadow-sm overflow-x-auto">
            <div class="px-4 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
                <span class="font-extrabold text-sm text-rose-900 uppercase">Danh sách học sinh nghỉ học trong Tuần ${tuanSo} (${kq.dsHocSinhNghi.length} em)</span>
            </div>
            <table class="w-full border-collapse text-xs">
                <thead class="bg-slate-50 text-slate-800 font-bold text-center">
                    <tr>
                        <th class="border border-slate-300 p-2 w-12">STT</th>
                        <th class="border border-slate-300 p-2 w-48 text-left">HỌ VÀ TÊN HỌC SINH</th>
                        <th class="border border-slate-300 p-2 w-20">LỚP</th>
                        <th class="border border-slate-300 p-2 w-24">SỐ NGÀY NGHỈ</th>
                        <th class="border border-slate-300 p-2 w-24">CÓ PHÉP / KP</th>
                        <th class="border border-slate-300 p-2 text-left">CHI TIẾT CÁC NGÀY NGHỈ TRONG TUẦN</th>
                    </tr>
                </thead>
                <tbody>
                    ${kq.dsHocSinhNghi.length === 0 ? `<tr><td colspan="6" class="text-center py-6 text-emerald-700 font-bold italic">Tuần ${tuanSo} chưa ghi nhận học sinh nào nghỉ học.</td></tr>` : kq.dsHocSinhNghi.map((hs, idx) => {
                        let chiTietTxt = hs.chiTietNgay.map(n => {
                            let bt = Array.from(new Set(n.buoiTiet)).join(', ');
                            let tag = n.loai === 'KP'
                                ? `<span class="text-rose-700 font-bold">[KP]</span>`
                                : `<span class="text-amber-800 font-bold">[P]</span>`;
                            return `${n.thu}${n.ngay ? ' (' + n.ngay + ')' : ''} ${tag} <span class="text-slate-500">(${bt})</span>`;
                        }).join(' • ');
                        return `<tr class="hover:bg-slate-50">
                            <td class="border border-slate-300 p-2 text-center font-bold text-slate-500">${idx + 1}</td>
                            <td class="border border-slate-300 p-2 font-bold text-slate-900">${hs.ten}</td>
                            <td class="border border-slate-300 p-2 text-center font-extrabold text-blue-900">${hs.lop}</td>
                            <td class="border border-slate-300 p-2 text-center font-extrabold text-rose-700">${hs.soNgayNghi}</td>
                            <td class="border border-slate-300 p-2 text-center font-semibold">${hs.soP}P / ${hs.soKP}KP</td>
                            <td class="border border-slate-300 p-2 leading-relaxed">${chiTietTxt}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = htmlBoLoc + htmlKPI + htmlBangMaTran + htmlBangHocSinh;
};

// 5. Xuất Excel Tổng hợp Sĩ số Tuần (gồm 2 sheet: Ma trận theo ngày + Danh sách từng HS nghỉ)
window.xuatExcelTongHopSiSo = async function() {
    let kq = trangThaiTongHopSiSo.ketQuaHienTai;
    if (!kq) return alert("Chưa có dữ liệu tổng hợp để xuất!");

    try {
        if (typeof ExcelJS === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const workbook = new ExcelJS.Workbook();

        // Sheet 1: Ma trận sĩ số theo ngày trong tuần
        const ws1 = workbook.addWorksheet(`SiSo_Tuan_${kq.tuanSo}`);
        let headers1 = ['STT', 'Lớp', 'Sĩ số chuẩn'];
        kq.dsThu.forEach(thu => {
            let ngay = kq.mapNgayTheoThu[thu] || '';
            headers1.push(ngay ? `${thu}\n(${ngay})` : thu);
        });
        headers1.push('Vắng P (tuần)', 'Vắng KP (tuần)', 'Học sinh nghỉ trong tuần');

        let rTitle1 = ws1.addRow([`TỔNG HỢP SĨ SỐ HỌC SINH THEO NGÀY - NĂM HỌC ${kq.namHoc} - TUẦN ${kq.tuanSo}`]);
        rTitle1.font = { name: 'Times New Roman', size: 14, bold: true };
        ws1.mergeCells(1, 1, 1, headers1.length);
        rTitle1.alignment = { horizontal: 'center', vertical: 'middle' };

        let rHead1 = ws1.addRow(headers1);
        rHead1.font = { name: 'Times New Roman', size: 12, bold: true };
        rHead1.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        rHead1.eachCell(c => {
            c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        });

        kq.ketQuaTheoLop.forEach((row, idx) => {
            let arr = [idx + 1, row.maLop, row.siSoChuan || ''];
            kq.dsThu.forEach(thu => {
                let cell = row.ngayData[thu];
                if (!cell || !cell.daDiemDanh) arr.push('--');
                else if (cell.chuoiFallback && cell.tong === 0) arr.push(cell.chuoiFallback);
                else if (cell.vangP === 0 && cell.vangKP === 0) arr.push(`${cell.coMat}/${cell.tong}`);
                else {
                    let txt = `${cell.coMat}/${cell.tong} (P:${cell.vangP}, KP:${cell.vangKP})`;
                    if (cell.dsTenP.length > 0) txt += `\nP: ${cell.dsTenP.join(', ')}`;
                    if (cell.dsTenKP.length > 0) txt += `\nKP: ${cell.dsTenKP.join(', ')}`;
                    arr.push(txt);
                }
            });
            arr.push(row.tongP, row.tongKP, row.tomTatHsLop.join('; '));
            let r = ws1.addRow(arr);
            r.font = { name: 'Times New Roman', size: 12 };
            r.eachCell({ includeEmpty: true }, (c, colIdx) => {
                c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                c.alignment = { vertical: 'middle', horizontal: colIdx === headers1.length ? 'left' : 'center', wrapText: true };
                c.numFmt = '@';
            });
        });

        ws1.getColumn(1).width = 6;
        ws1.getColumn(2).width = 10;
        ws1.getColumn(3).width = 12;
        for (let i = 4; i <= 3 + kq.dsThu.length; i++) ws1.getColumn(i).width = 22;
        ws1.getColumn(headers1.length - 2).width = 12;
        ws1.getColumn(headers1.length - 1).width = 12;
        ws1.getColumn(headers1.length).width = 32;

        // Sheet 2: Danh sách học sinh nghỉ trong tuần
        const ws2 = workbook.addWorksheet(`HS_Nghi_Tuan_${kq.tuanSo}`);
        let rTitle2 = ws2.addRow([`DANH SÁCH HỌC SINH NGHỈ HỌC - NĂM HỌC ${kq.namHoc} - TUẦN ${kq.tuanSo}`]);
        rTitle2.font = { name: 'Times New Roman', size: 14, bold: true };
        ws2.mergeCells('A1:F1');
        rTitle2.alignment = { horizontal: 'center', vertical: 'middle' };

        let rHead2 = ws2.addRow(['STT', 'Họ và tên HS', 'Lớp', 'Số ngày nghỉ', 'Có phép / KP', 'Chi tiết các ngày nghỉ']);
        rHead2.font = { name: 'Times New Roman', size: 12, bold: true };
        rHead2.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        rHead2.eachCell(c => {
            c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        });

        kq.dsHocSinhNghi.forEach((hs, idx) => {
            let chiTietStr = hs.chiTietNgay.map(n => {
                let bt = Array.from(new Set(n.buoiTiet)).join(', ');
                return `${n.thu}${n.ngay ? ' (' + n.ngay + ')' : ''} [${n.loai}] (${bt})`;
            }).join(' | ');
            let r = ws2.addRow([idx + 1, hs.ten, hs.lop, hs.soNgayNghi, `${hs.soP}P / ${hs.soKP}KP`, chiTietStr]);
            r.font = { name: 'Times New Roman', size: 12 };
            r.eachCell({ includeEmpty: true }, (c, colIdx) => {
                c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                c.alignment = { vertical: 'middle', horizontal: [1, 3, 4, 5].includes(colIdx) ? 'center' : 'left', wrapText: true };
            });
        });

        [6, 26, 10, 14, 15, 48].forEach((w, i) => { ws2.getColumn(i + 1).width = w; });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `TongHopSiSo_Tuan${kq.tuanSo}.xlsx`;
        link.click();
    } catch (loi) {
        alert("Lỗi khi xuất Excel tổng hợp sĩ số: " + loi.message);
    }
};
