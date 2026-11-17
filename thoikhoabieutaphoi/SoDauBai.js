// =========================================================================
// KHỐI 1: CỔNG NHẬN YÊU CẦU TỪ WEB (HỢP NHẤT UI VÀ API)
// =========================================================================
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.thaoTac) {
      var thaoTac = e.parameter.thaoTac;
      
      if (thaoTac === 'layDuLieuKhoiTao') return xuatDuLieuJson(layDuLieuKhoiTao());
      if (thaoTac === 'layCauHinh') return xuatDuLieuJson(layCauHinhHeThongToiUu());
      if (thaoTac === 'layTKB') return xuatDuLieuJson(docDuLieuTKB(e.parameter.tuan, e.parameter.nguon, e.parameter.namHoc));
      if (thaoTac === 'xepLichTuDong') return xuatDuLieuJson(khoiTaoLichTuDong(e.parameter.tuan));
      if (thaoTac === 'layCayQuanHeThongKe') return xuatDuLieuJson(docCayQuanHeThongKe());
      if (thaoTac === 'traCuuThongKe') return xuatDuLieuJson(traCuuDuLieuThongKe(e.parameter.namHoc, e.parameter.thang, e.parameter.tuan, e.parameter.giaoVien));
      if (thaoTac === 'layBanGhiKhungChuongTrinh') return xuatDuLieuJson(layBanGhiKhungChuongTrinh());
      if (thaoTac === 'layDanhMucGV') return xuatDuLieuJson(layDuLieuDanhMucGV());
      if (thaoTac === 'layCaiDat') return xuatDuLieuJson(layDuLieuCaiDat());
      if (thaoTac === 'layDanhMucLop') return xuatDuLieuJson(layDuLieuDanhMucLop());
      if (thaoTac === 'layTkbVaPpct') return xuatDuLieuJson(layTkbVaPpct(e.parameter.tuan, e.parameter.lop, e.parameter.khoi, e.parameter.mon, e.parameter.tuanHienTai, e.parameter.daCoPpct, e.parameter.daCoTkb));
      if (thaoTac === 'layDanhMucSGK') return xuatDuLieuJson(docDanhMucSGK());
      if (thaoTac === 'layDanhMucSGKToanBo') return xuatDuLieuJson(layThongTinDanhMucToanBo());
      if (thaoTac === 'layTienDoTichLuy') return xuatDuLieuJson(layTienDoTichLuy(e.parameter.tuan, e.parameter.namHoc));
      if (thaoTac === 'layTrangThaiKhoaTKB') return xuatDuLieuJson(layTrangThaiKhoaTKB(null, e.parameter.namHoc));
      if (thaoTac === 'layDuLieuSoDauBai') return xuatDuLieuJson(layDuLieuSoDauBai_ToanBo(e.parameter.emailTruyCap, e.parameter.taiToanBo));
      if (thaoTac === 'layPhanQuyenHethong') return xuatDuLieuJson(layDuLieuPhanQuyenHethong());
      if (thaoTac === 'checkOnline' || thaoTac === 'diemDanhOnline' || thaoTac === 'roiTrangOnline') return xuatDuLieuJson(xuLyCheckOnlineMayChu(e.parameter));
      if (e.parameter.emailTruyCap) { try { ghiNhanHienDienTuDong(e.parameter.emailTruyCap); } catch(errOnl) {} }

      return xuatDuLieuJson({ trangThai: 'thanh_cong' });
    }
    
    // [KHẮC PHỤC LỖI INDEX]: Trả về thông báo an toàn thay vì gọi HtmlService
    return ContentService.createTextOutput("Hệ thống API Backend đang hoạt động bình thường. Vui lòng truyền tham số thaoTac để lấy dữ liệu.").setMimeType(ContentService.MimeType.TEXT);

  } catch (loi) {
    return xuatDuLieuJson({ trangThai: 'loi_he_thong', thongBao: loi.toString() });
  }
}
    
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
        return xuatDuLieuJson({ trangThai: 'loi_du_lieu', thongBao: 'Dữ liệu gửi lên trống.' });
    }
    
    var duLieuNhan;
    try {
        duLieuNhan = JSON.parse(e.postData.contents);
    } catch (parseLoi) {
        return xuatDuLieuJson({ trangThai: 'loi_dinh_dang', thongBao: 'Dữ liệu JSON không hợp lệ.' });
    }
    
    if (duLieuNhan.thaoTac === 'roiTrangOnline' || duLieuNhan.thaoTac === 'diemDanhOnline' || duLieuNhan.thaoTac === 'checkOnline') return xuatDuLieuJson(xuLyCheckOnlineMayChu(duLieuNhan));
    if (duLieuNhan && duLieuNhan.emailTruyCap) { try { ghiNhanHienDienTuDong(duLieuNhan.emailTruyCap); } catch(errOnlPost) {} }
    if (duLieuNhan.thaoTac === 'luuDuLieu') return xuatDuLieuJson(xuLyLuuDuLieu(duLieuNhan));
    if (duLieuNhan.thaoTac === 'khoaMoSoDauBai') return xuatDuLieuJson(xuLyKhoaMoSoDauBai(duLieuNhan));
    if (duLieuNhan.thaoTac === 'khoaMoTKB') return xuatDuLieuJson(xuLyKhoaMoTKB(duLieuNhan));
    if (duLieuNhan.thaoTac === 'luuDuLieuPhanCong') return xuatDuLieuJson(luuDuLieuPhanCong(duLieuNhan.duLieu));
    if (duLieuNhan.thaoTac === 'luuBanGhiKhungChuongTrinh') return xuatDuLieuJson(luuBanGhiKhungChuongTrinh(duLieuNhan.duLieu));
    if (duLieuNhan.thaoTac === 'luuDanhMucGV') return xuatDuLieuJson(luuDuLieuDanhMucGV(duLieuNhan.duLieu));
    if (duLieuNhan.thaoTac === 'luuCaiDat') return xuatDuLieuJson(luuDuLieuCaiDat(duLieuNhan.duLieu));
    if (duLieuNhan.thaoTac === 'luuDanhMucLop') return xuatDuLieuJson(luuDuLieuDanhMucLop(duLieuNhan.duLieu));
    if (duLieuNhan.thaoTac === 'luuPPCT') return xuatDuLieuJson(luuDuLieuPPCT(duLieuNhan.duLieu));
    if (duLieuNhan.thaoTac === 'luuDanhMucSGK') return xuatDuLieuJson(luuDuLieuDanhMucSGK(duLieuNhan.duLieu));
    if (duLieuNhan.thaoTac === 'luuSoDauBaiDongBo') return xuatDuLieuJson(luuSoDauBaiDongBo(duLieuNhan));
    if (duLieuNhan.thaoTac === 'luuPhanQuyenHethong') return xuatDuLieuJson(luuDuLieuPhanQuyenHethong(duLieuNhan.duLieu));
    if (duLieuNhan.thaoTac === 'chuyenDoiCongKhai') return xuatDuLieuJson(chuyenDoiCongKhai1Click(duLieuNhan));
    if (duLieuNhan.thaoTac === 'luuSuaTkbHienTai') return xuatDuLieuJson(luuSuaTkbHienTai(duLieuNhan.duLieu, duLieuNhan.duLieuToanLuoi, duLieuNhan.tuan, duLieuNhan.laTuanHienTai));
    if (duLieuNhan.thaoTac === 'chuyenTuanTiepTheoDongBo') return xuatDuLieuJson(xuLyChuyenTuanTiepTheoDongBo(duLieuNhan));
    if (duLieuNhan.thaoTac === 'luuCapNhatDanhMucSGK') {
        var ketQuaLuu = ghiDeDanhMucSGK(duLieuNhan.duLieuBang);
        return xuatDuLieuJson(JSON.parse(ketQuaLuu));
    }

    return xuatDuLieuJson({ trangThai: 'khong_ro_thao_tac' });
  } catch (loi) {
    return xuatDuLieuJson({ trangThai: 'loi_he_thong', thongBao: loi.toString() });
  }
}

function xuatDuLieuJson(duLieu) { 
  return ContentService.createTextOutput(JSON.stringify(duLieu)).setMimeType(ContentService.MimeType.JSON); 
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// =========================================================================
// KHỐI 2: ĐỌC BIẾN MÔI TRƯỜNG VÀ CÁC DANH MỤC
// =========================================================================
// =========================================================================
// BỘ HÀM TIỆN ÍCH CHUẨN HÓA NGÀY THỨ 2 ĐẦU TUẦN & TỰ ĐỘNG GÁN TKB_CODINH
// =========================================================================
function parseNgayTkbAnToan(rawVal, dispVal) {
  var s = dispVal !== undefined && dispVal !== null ? String(dispVal).trim() : '';
  if (!s && rawVal !== undefined && rawVal !== null && !(rawVal instanceof Date)) {
    s = String(rawVal).trim();
  }
  if (s && s !== '--' && s !== '--/--/----') {
    var m1 = s.match(/^(\d{1,2})[\/\-\.\s]+(\d{1,2})[\/\-\.\s]+(\d{4})$/);
    if (m1) {
      var d1 = new Date(parseInt(m1[3], 10), parseInt(m1[2], 10) - 1, parseInt(m1[1], 10));
      if (!isNaN(d1.getTime())) return d1;
    }
    var m2 = s.match(/^(\d{4})[\/\-\.\s]+(\d{1,2})[\/\-\.\s]+(\d{1,2})$/);
    if (m2) {
      var d2 = new Date(parseInt(m2[1], 10), parseInt(m2[2], 10) - 1, parseInt(m2[3], 10));
      if (!isNaN(d2.getTime())) return d2;
    }
  }
  if (rawVal instanceof Date && !isNaN(rawVal.getTime())) {
    return new Date(rawVal.getFullYear(), rawVal.getMonth(), rawVal.getDate());
  }
  return null;
}

function duaNgayVeThu2(d) {
  if (!d || isNaN(d.getTime())) return null;
  var kq = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var dow = kq.getDay();
  var diff = (dow === 0) ? -6 : (1 - dow);
  kq.setDate(kq.getDate() + diff);
  kq.setHours(0, 0, 0, 0);
  return kq;
}

function tinhDoLechThuTkb(thuStr) {
  if (!thuStr) return 0;
  var s = String(thuStr).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
  if (s.match(/^[2-7]$/)) s = 'thứ ' + s;
  if (s === 'cn' || s === 'chu nhat') s = 'chủ nhật';
  var map = { 'thứ 2': 0, 'thứ 3': 1, 'thứ 4': 2, 'thứ 5': 3, 'thứ 6': 4, 'thứ 7': 5, 'chủ nhật': 6 };
  return (map[s] !== undefined) ? map[s] : 0;
}

function dinhDangThongTinNgay(d) {
  if (!d || isNaN(d.getTime())) return null;
  var dd = d.getDate().toString().padStart(2, '0');
  var mm = (d.getMonth() + 1).toString().padStart(2, '0');
  var yyyy = d.getFullYear();
  return {
    dateObj: d,
    dmy: dd + '/' + mm + '/' + yyyy,
    ymd: yyyy + '-' + mm + '-' + dd,
    thang: mm,
    nam: String(yyyy)
  };
}

function layNgayThu2DauTuanTuCaiDat(ss) {
  try {
    if (!ss) ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var shCD = ss.getSheetByName('CAI_DAT');
    if (!shCD || shCD.getLastRow() < 2) return null;
    var lastRow = shCD.getLastRow();
    var rawVals = shCD.getRange(1, 1, lastRow, 5).getValues();
    var dispVals = shCD.getRange(1, 1, lastRow, 5).getDisplayValues();

    var dTimThay = null;
    var cacKhoaBoQua = { 'NAM_HOC': true, 'SO_TIET_SANG': true, 'SO_TIET_CHIEU': true, 'TUAN_HIEN_TAI': true, 'TRANG_THAI_WEB': true };

    // Ưu tiên 1: Tìm theo tên mã tham số (Cột A) hoặc ghi chú (Cột C) có từ khóa ngày đầu tuần / tuần 1 / thứ 2
    for (var i = 1; i < rawVals.length; i++) {
      var ma = String(dispVals[i][0] || '').trim().toUpperCase();
      var ghiChu = String(dispVals[i][2] || '').trim().toUpperCase();
      if (!ma || cacKhoaBoQua[ma]) continue;
      if (ma.indexOf('THU_2') !== -1 || ma.indexOf('THU2') !== -1 || ma.indexOf('DAU_TUAN') !== -1 ||
          ma.indexOf('TUAN_1') !== -1 || ma.indexOf('TUAN1') !== -1 || ma.indexOf('BAT_DAU') !== -1 ||
          ma.indexOf('KHAI_GIANG') !== -1 || ma.indexOf('AP_DUNG') !== -1 || ma.indexOf('NGAY') !== -1 ||
          ghiChu.indexOf('THỨ 2') !== -1 || ghiChu.indexOf('ĐẦU TUẦN') !== -1 || ghiChu.indexOf('TUẦN 1') !== -1 ||
          ghiChu.indexOf('BẮT ĐẦU') !== -1 || ghiChu.indexOf('NGÀY') !== -1) {
        var dTmp = parseNgayTkbAnToan(rawVals[i][1], dispVals[i][1]);
        if (dTmp && dTmp.getFullYear() >= 2020 && dTmp.getFullYear() <= 2100) {
          dTimThay = dTmp;
          break;
        }
      }
    }

    // Ưu tiên 2 (Dự phòng): Quét bất kỳ dòng nào trong CAI_DAT có giá trị cột B là kiểu Ngày hợp lệ
    if (!dTimThay) {
      for (var j = 1; j < rawVals.length; j++) {
        var ma2 = String(dispVals[j][0] || '').trim().toUpperCase();
        if (cacKhoaBoQua[ma2]) continue;
        var dTmp2 = parseNgayTkbAnToan(rawVals[j][1], dispVals[j][1]);
        if (dTmp2 && dTmp2.getFullYear() >= 2020 && dTmp2.getFullYear() <= 2100) {
          dTimThay = dTmp2;
          break;
        }
      }
    }

    if (dTimThay) {
      return dinhDangThongTinNgay(duaNgayVeThu2(dTimThay));
    }
  } catch (e) {}
  return null;
}

// Khi sheet TKB_HIEN_TAI trống -> Tự động gán toàn bộ TKB_CoDinh sang TKB_HIEN_TAI với Tuần = 1 và Thứ 2 đầu tuần lấy từ CAI_DAT
function damBaoTkbHienTaiKhiTrong(ss) {
  try {
    if (!ss) ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var tieuDeChuan = ['Mã Tiết', 'Năm học', 'Tuần', 'Thứ', 'Buổi', 'Tiết', 'Mã Lớp', 'Môn Học', 'Mã GV', 'Tháng', 'Ngày', 'Trạng thái'];
    var soCotChuan = tieuDeChuan.length;

    var shHT = ss.getSheetByName('TKB_HIEN_TAI');
    if (!shHT) {
      shHT = ss.insertSheet('TKB_HIEN_TAI');
      shHT.getRange(1, 1, 1, soCotChuan).setValues([tieuDeChuan]).setFontWeight("bold").setBackground("#e2e8f0");
    }

    var lrHT = shHT.getLastRow();
    var coDuLieu = false;
    if (lrHT >= 2) {
      var dataHT = shHT.getRange(2, 1, lrHT - 1, soCotChuan).getDisplayValues();
      for (var r = 0; r < dataHT.length; r++) {
        var cMa = String(dataHT[r][0] || '').trim();
        var cLop = String(dataHT[r][6] || '').trim();
        var cMon = String(dataHT[r][7] || '').trim();
        if ((cMa !== '' && cMa !== 'Mã Tiết') && (cLop !== '' || cMon !== '')) {
          coDuLieu = true;
          break;
        }
      }
    }

    if (coDuLieu) return false;

    // Sheet TKB_HIEN_TAI đang trống -> Tự động lấy TKB_CoDinh gán sang và lấy Thứ 2 đầu tuần từ CAI_DAT
    var shCD = ss.getSheetByName('TKB_CoDinh');
    if (!shCD || shCD.getLastRow() < 2) return false;

    var lrCD = shCD.getLastRow();
    var dataCD = shCD.getRange(2, 1, lrCD - 1, soCotChuan).getDisplayValues();
    var namHocHienTai = layNamHocHienTai(ss);
    var infoThu2 = layNgayThu2DauTuanTuCaiDat(ss);
    var tuanKhoiTao = 1;

    var mangGhi = [tieuDeChuan];
    for (var i = 0; i < dataCD.length; i++) {
      var row = dataCD[i];
      var maLop = String(row[6] || '').trim();
      var monHoc = String(row[7] || '').trim();
      if (!maLop || !monHoc) continue;

      var thu = String(row[3] || '').trim();
      var buoi = String(row[4] || '').trim();
      var tiet = String(row[5] || '').trim();
      var maGv = String(row[8] || '').trim();
      var nhDong = String(row[1] || '').trim() || namHocHienTai;
      var tienToBuoi = (buoi === "Sáng") ? "S" : "C";
      var maTietMoi = (nhDong ? (nhDong + "_") : "") + tuanKhoiTao + "_" + thu + "_" + tienToBuoi + "_" + tiet + "_" + maLop;

      var thangStr = '';
      var ngayStr = '';
      if (infoThu2 && infoThu2.dateObj) {
        var offset = tinhDoLechThuTkb(thu);
        var dTiet = new Date(infoThu2.dateObj.getFullYear(), infoThu2.dateObj.getMonth(), infoThu2.dateObj.getDate() + offset);
        var infoTiet = dinhDangThongTinNgay(dTiet);
        if (infoTiet) {
          thangStr = infoTiet.thang;
          ngayStr = infoTiet.dmy;
        }
      }

      mangGhi.push([maTietMoi, nhDong, tuanKhoiTao, thu, buoi, tiet, maLop, monHoc, maGv, thangStr, ngayStr]);
    }

    if (mangGhi.length > 1) {
      shHT.clearContents();
      shHT.getRange(1, 1, mangGhi.length, soCotChuan).setValues(mangGhi);

      // Đồng bộ TUAN_HIEN_TAI = 1 trong CAI_DAT nếu có
      var shCaiDat = ss.getSheetByName('CAI_DAT');
      if (shCaiDat && shCaiDat.getLastRow() > 1) {
        var dataCDat = shCaiDat.getRange(1, 1, shCaiDat.getLastRow(), 2).getDisplayValues();
        for (var k = 1; k < dataCDat.length; k++) {
          if (String(dataCDat[k][0] || '').trim().toUpperCase() === 'TUAN_HIEN_TAI') {
            shCaiDat.getRange(k + 1, 2).setValue(tuanKhoiTao);
            break;
          }
        }
      }
      SpreadsheetApp.flush();
      if (typeof xoaCacheHeThongToanDien === 'function') xoaCacheHeThongToanDien();
      return true;
    }
  } catch (e) {}
  return false;
}

function docBangCauHinh() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  damBaoTkbHienTaiKhiTrong(ss);
  var trang = ss.getSheetByName('CAI_DAT');
  var mang = trang ? trang.getDataRange().getDisplayValues() : [];
  var kq = { DANH_SACH_QUAN_TRI: [] }; 
  for (var i = 1; i < mang.length; i++) {
      var kName = String(mang[i][0] || '').trim();
      if (kName) kq[kName] = String(mang[i][1] || '').trim();
      if (mang[i][4]) kq.DANH_SACH_QUAN_TRI.push(mang[i][4].toString().trim()); 
  }
  var infoThu2CD = layNgayThu2DauTuanTuCaiDat(ss);
  if (infoThu2CD) {
      kq.NGAY_THU_2_CAI_DAT = infoThu2CD.dmy;
      kq.NGAY_THU_2_CAI_DAT_YMD = infoThu2CD.ymd;
  }
  var trangHT = ss.getSheetByName('TKB_HIEN_TAI');
  if (trangHT) {
      var lastRow = trangHT.getLastRow();
      if (lastRow > 1) {
          var mangHT = trangHT.getRange(1, 1, lastRow, 11).getValues();
          var dispHT = trangHT.getRange(1, 1, lastRow, 11).getDisplayValues();
          var maxTuan = 0;
          var dThu2HT = null;
          for (var j = 1; j < mangHT.length; j++) {
              if (dispHT[j][0] === 'Mã Tiết' || dispHT[j][0] === '') continue;
              var t = parseInt(String(dispHT[j][2] || '').replace(/\D/g, ''), 10);
              if (!isNaN(t) && t > maxTuan) maxTuan = t;
              if (!dThu2HT && (mangHT[j][10] || dispHT[j][10])) {
                  var dParsed = parseNgayTkbAnToan(mangHT[j][10], dispHT[j][10]);
                  if (dParsed) {
                      var offset = tinhDoLechThuTkb(dispHT[j][3]);
                      dThu2HT = duaNgayVeThu2(new Date(dParsed.getFullYear(), dParsed.getMonth(), dParsed.getDate() - offset));
                  }
              }
          }
          if (maxTuan > 0) kq.TUAN_HIEN_TAI = maxTuan;
          if (dThu2HT) {
              var infoHT = dinhDangThongTinNgay(dThu2HT);
              kq.NGAY_K2 = infoHT.dmy;
              kq.NGAY_THU_2_HIEN_TAI_YMD = infoHT.ymd;
              kq.THU_K2 = 'Thứ 2';
          }
      }
  }
  return kq;
}

// =========================================================================
// HÀM MÁY CHỦ BỔ SUNG: LẤY CẤU HÌNH HỆ THỐNG QUA BỘ NHỚ ĐỆM (CACHE)
// =========================================================================
function layCauHinhHeThongToiUu() {
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    // Đảm bảo nếu TKB_HIEN_TAI đang trống thì lập tức tự động gán TKB_CoDinh sang và lấy Thứ 2 từ CAI_DAT
    var daTuDongGan = damBaoTkbHienTaiKhiTrong(ss);

    var cache = CacheService.getScriptCache();
    var cacheKey = "CACHE_CAU_HINH_HT_V2";
    var cachedChunks = (!daTuDongGan) ? cache.get(cacheKey + "_count") : null;
    var duLieuCauHinh = null;

    // 1. Cố gắng lấy từ RAM
    if (cachedChunks) {
        var fullString = "";
        var isCacheValid = true;
        for (var c = 0; c < parseInt(cachedChunks); c++) {
            var chunk = cache.get(cacheKey + "_" + c);
            if (!chunk) { isCacheValid = false; break; }
            fullString += chunk;
        }
        if (isCacheValid) {
            try { duLieuCauHinh = JSON.parse(fullString); } catch(e) { duLieuCauHinh = null; }
        }
    }

    // Kiểm tra nhanh tính đồng bộ giữa Cache và dòng đầu tiên của TKB_HIEN_TAI (phòng trường hợp người dùng vừa xóa/sửa trực tiếp trên Sheet)
    if (duLieuCauHinh) {
        var shCheck = ss.getSheetByName('TKB_HIEN_TAI');
        if (!shCheck || shCheck.getLastRow() < 2) {
            duLieuCauHinh = null;
        } else {
            var row2Check = shCheck.getRange(2, 1, 1, 11).getDisplayValues()[0];
            var tuanRow2 = parseInt(String(row2Check[2] || '').replace(/\D/g, ''), 10) || 1;
            if (parseInt(duLieuCauHinh.TUAN_HIEN_TAI, 10) !== tuanRow2) {
                duLieuCauHinh = null;
            }
        }
    }

    // 2. Nếu RAM trống hoặc cần làm mới, đọc từ CSDL và lưu lại vào RAM (Sống trong 5 phút)
    if (!duLieuCauHinh) {
        duLieuCauHinh = { DANH_SACH_QUAN_TRI: [], DANH_SACH_LOP: [], DANH_SACH_GIAO_VIEN: [], DINH_MUC_GIAO_VIEN: {}, DANH_SACH_MON_HOC: [], KHUNG_CHUONG_TRINH: {}, TKB_TUAN: [] };
        duLieuCauHinh.TRANG_THAI_KHOA_TKB = layTrangThaiKhoaTKB(ss, layNamHocHienTai(ss));

        var shCaiDat = ss.getSheetByName('CAI_DAT');
        if (shCaiDat && shCaiDat.getLastRow() > 0) {
            var mangCD = shCaiDat.getRange(1, 1, shCaiDat.getLastRow(), 5).getDisplayValues();
            for (var i = 1; i < mangCD.length; i++) {
                var keyCD = String(mangCD[i][0] || '').trim();
                if (keyCD) duLieuCauHinh[keyCD] = String(mangCD[i][1] || '').trim();
                if (mangCD[i][4]) duLieuCauHinh.DANH_SACH_QUAN_TRI.push(String(mangCD[i][4]).trim());
            }
        }

        var infoThu2CaiDat = layNgayThu2DauTuanTuCaiDat(ss);
        if (infoThu2CaiDat) {
            duLieuCauHinh.NGAY_THU_2_CAI_DAT = infoThu2CaiDat.dmy;
            duLieuCauHinh.NGAY_THU_2_CAI_DAT_YMD = infoThu2CaiDat.ymd;
        }
        
        var shTkbHT = ss.getSheetByName('TKB_HIEN_TAI');
        var maxTuan = 0;
        var coDuLieuTuan = false;
        var dThu2HienTai = null;
        
        if (shTkbHT && shTkbHT.getLastRow() > 1) {
            var maxColHT = Math.max(shTkbHT.getLastColumn(), 12);
            var rawHT = shTkbHT.getRange(1, 1, shTkbHT.getLastRow(), maxColHT).getValues();
            var mangHT = shTkbHT.getRange(1, 1, shTkbHT.getLastRow(), maxColHT).getDisplayValues();
            for (var j = 1; j < mangHT.length; j++) {
                if (mangHT[j][0] === 'Mã Tiết' || mangHT[j][0] === '') continue;
                var t = parseInt(String(mangHT[j][2] || '').replace(/\D/g, ''), 10);
                if (!isNaN(t) && t > maxTuan) maxTuan = t;
            }
            if (maxTuan <= 0) maxTuan = 1;
            duLieuCauHinh.TUAN_HIEN_TAI = maxTuan;

            var locStr = maxTuan.toString();
            for (var i = 1; i < mangHT.length; i++) {
                if (mangHT[i][0] === 'Mã Tiết' || mangHT[i][0] === '') continue;
                var tuanStr = mangHT[i][2] ? String(mangHT[i][2]).replace(/\D/g, '').trim() : '';
                if (tuanStr === locStr || (tuanStr === '' && maxTuan === 1)) {
                    var dRow = parseNgayTkbAnToan(rawHT[i][10], mangHT[i][10]);
                    var ngayStr = '';
                    var thangStr = mangHT[i][9] ? String(mangHT[i][9]).trim() : '';
                    if (dRow) {
                        var infoRow = dinhDangThongTinNgay(dRow);
                        ngayStr = infoRow.dmy;
                        if (!thangStr) thangStr = infoRow.thang;
                        if (!dThu2HienTai) {
                            var offsetThu = tinhDoLechThuTkb(mangHT[i][3]);
                            dThu2HienTai = duaNgayVeThu2(new Date(dRow.getFullYear(), dRow.getMonth(), dRow.getDate() - offsetThu));
                        }
                    } else {
                        ngayStr = String(mangHT[i][10] || '').trim();
                    }

                    var col12ValHT = (mangHT[i].length > 11 && mangHT[i][11]) ? String(mangHT[i][11]).trim() : '';
                    duLieuCauHinh.TKB_TUAN.push({
                        maTiet: mangHT[i][0], namHoc: mangHT[i][1], tuan: maxTuan, thu: mangHT[i][3], 
                        buoi: mangHT[i][4], tiet: mangHT[i][5], maLop: mangHT[i][6], monHoc: mangHT[i][7], 
                        maGv: mangHT[i][8], thang: thangStr, ngay: ngayStr,
                        trangThai: col12ValHT,
                        ghiChu: col12ValHT
                    });
                    coDuLieuTuan = true;
                }
            }
        }
        
        if (!dThu2HienTai && infoThu2CaiDat && infoThu2CaiDat.dateObj) {
            var tuanTinh = maxTuan > 0 ? maxTuan : 1;
            dThu2HienTai = duaNgayVeThu2(new Date(infoThu2CaiDat.dateObj.getFullYear(), infoThu2CaiDat.dateObj.getMonth(), infoThu2CaiDat.dateObj.getDate() + (tuanTinh - 1) * 7));
        }

        if (dThu2HienTai) {
            var infoHT2 = dinhDangThongTinNgay(dThu2HienTai);
            duLieuCauHinh.NGAY_K2 = infoHT2.dmy;
            duLieuCauHinh.NGAY_THU_2_HIEN_TAI_YMD = infoHT2.ymd;
            duLieuCauHinh.THU_K2 = 'Thứ 2';
        }
        
        if (!coDuLieuTuan) {
            duLieuCauHinh.TUAN_HIEN_TAI = 1;
            var trangCoDinh = ss.getSheetByName('TKB_CoDinh');
            if (trangCoDinh && trangCoDinh.getLastRow() > 1) {
                var mangCD_TKB = trangCoDinh.getRange(1, 1, trangCoDinh.getLastRow(), 11).getDisplayValues(); 
                var strMaxTuan = '1';
                for (var i = 1; i < mangCD_TKB.length; i++) {
                    if (mangCD_TKB[i][0] === 'Mã Tiết' || mangCD_TKB[i][0] === '') continue;
                    var tienToBuoi = (mangCD_TKB[i][4] === "Sáng") ? "S" : "C";
                    var nhDongCD = mangCD_TKB[i][1] || layNamHocHienTai(ss);
                    var maTietAo = nhDongCD + "_" + strMaxTuan + "_" + mangCD_TKB[i][3] + "_" + tienToBuoi + "_" + mangCD_TKB[i][5] + "_" + mangCD_TKB[i][6];
                    var thangCD = '';
                    var ngayCD = '';
                    if (dThu2HienTai) {
                        var offCD = tinhDoLechThuTkb(mangCD_TKB[i][3]);
                        var dTietCD = dinhDangThongTinNgay(new Date(dThu2HienTai.getFullYear(), dThu2HienTai.getMonth(), dThu2HienTai.getDate() + offCD));
                        if (dTietCD) { thangCD = dTietCD.thang; ngayCD = dTietCD.dmy; }
                    }

                    duLieuCauHinh.TKB_TUAN.push({ 
                        maTiet: maTietAo, namHoc: nhDongCD, tuan: 1, thu: mangCD_TKB[i][3], 
                        buoi: mangCD_TKB[i][4], tiet: mangCD_TKB[i][5], maLop: mangCD_TKB[i][6], monHoc: mangCD_TKB[i][7], 
                        maGv: mangCD_TKB[i][8], thang: thangCD, ngay: ngayCD 
                    });
                }
            }
        } else {
            boSungNgayThangDayDuChoTKB(duLieuCauHinh.TKB_TUAN, ss, duLieuCauHinh.TUAN_HIEN_TAI);
        }

        var shLop = ss.getSheetByName('DM_LOP');
        duLieuCauHinh.GVCN_THEO_LOP = {};
        duLieuCauHinh.SI_SO_THEO_LOP = {};
        if (shLop && shLop.getLastRow() > 1) {
            var maxColLopCH = Math.min(Math.max(shLop.getLastColumn(), 3), 4);
            var dataLop = shLop.getRange(2, 1, shLop.getLastRow() - 1, maxColLopCH).getDisplayValues(); // Đọc 3-4 cột A, B, C, (D: Sĩ số)
            for (var i = 0; i < dataLop.length; i++) {
                var mLop = String(dataLop[i][0]).trim();
                if (mLop) {
                    duLieuCauHinh.DANH_SACH_LOP.push(mLop);
                    duLieuCauHinh.GVCN_THEO_LOP[mLop] = String(dataLop[i][2] || '').trim(); // Cột C (Index 2) là GVCN
                    if (dataLop[i].length > 3) {
                        var rawSiSo = String(dataLop[i][3] || '').replace(/\D/g, '');
                        if (rawSiSo) {
                            duLieuCauHinh.SI_SO_THEO_LOP[mLop.toUpperCase()] = parseInt(rawSiSo, 10) || 0;
                        }
                    }
                }
            }
        }

        var shGV = ss.getSheetByName('DM_GIAOVIEN');
        duLieuCauHinh.TU_DIEN_HO_TEN_GV = {};
        if (shGV && shGV.getLastRow() > 1) {
            // UI Thời khóa biểu sử dụng Mã GV cột A; Sổ đầu bài sử dụng thêm TU_DIEN_HO_TEN_GV (Cột B) để ký tên đầy đủ
            var dataGV = shGV.getRange(2, 1, shGV.getLastRow() - 1, 4).getDisplayValues();
            for (var g = 0; g < dataGV.length; g++) {
                var maGV = String(dataGV[g][0] || '').trim();
                var hoTenGV = String(dataGV[g][1] || '').trim();
                var dinhMuc = (dataGV[g].length > 3) ? (parseInt(dataGV[g][3], 10) || 0) : 0;
                
                if (maGV !== '') {
                    if (duLieuCauHinh.DANH_SACH_GIAO_VIEN.indexOf(maGV) === -1) {
                        duLieuCauHinh.DANH_SACH_GIAO_VIEN.push(maGV);
                        duLieuCauHinh.DINH_MUC_GIAO_VIEN[maGV] = dinhMuc;
                    }
                    duLieuCauHinh.TU_DIEN_HO_TEN_GV[maGV.toLowerCase().normalize('NFC')] = hoTenGV || maGV;
                }
            }
        }

        var shKhung = ss.getSheetByName('KHUNG_CHUONG_TRINH');
        if (shKhung && shKhung.getLastRow() > 0 && shKhung.getLastColumn() > 0) {
            var mangKhung = shKhung.getRange(1, 1, shKhung.getLastRow(), shKhung.getLastColumn()).getDisplayValues();
            if (mangKhung.length > 1) {
                var tieuDeKhung = mangKhung[0];
                for (var i = 1; i < mangKhung.length; i++) {
                    var mon = mangKhung[i][0] ? String(mangKhung[i][0]).trim() : '';
                    if (!mon || mon.toLowerCase() === 'môn học' || mon === '---') continue;
                    if (duLieuCauHinh.DANH_SACH_MON_HOC.indexOf(mon) === -1) {
                        duLieuCauHinh.DANH_SACH_MON_HOC.push(mon);
                    }
                    for (var j = 1; j < tieuDeKhung.length; j++) {
                        var khoi = tieuDeKhung[j] ? String(tieuDeKhung[j]).trim() : '';
                        var tiet = parseInt(mangKhung[i][j]) || 0;
                        if (khoi) { 
                            if (!duLieuCauHinh.KHUNG_CHUONG_TRINH[khoi]) duLieuCauHinh.KHUNG_CHUONG_TRINH[khoi] = {}; 
                            duLieuCauHinh.KHUNG_CHUONG_TRINH[khoi][mon] = tiet; 
                        }
                    }
                }
            }
        }

        var shPhanQuyen = ss.getSheetByName('PHAN_QUYEN_ADMIN');
        duLieuCauHinh.MA_TRAN_PHAN_QUYEN = {};
        duLieuCauHinh.QUYEN_CONG_KHAI = { menu: [], nut: [], lop: [] };
        if (shPhanQuyen && shPhanQuyen.getLastRow() > 1) {
            var mangPQ = shPhanQuyen.getRange(2, 1, shPhanQuyen.getLastRow() - 1, 4).getDisplayValues();
            for (var p = 0; p < mangPQ.length; p++) {
                var dinhDanh = String(mangPQ[p][0]).trim();
                if (dinhDanh !== '') {
                    var objQuyen = {
                        lop: mangPQ[p][1] ? String(mangPQ[p][1]).split(',').map(function(s){return s.trim()}).filter(String) : [],
                        nut: mangPQ[p][2] ? String(mangPQ[p][2]).split(',').map(function(s){return s.trim()}).filter(String) : [],
                        menu: mangPQ[p][3] ? String(mangPQ[p][3]).split(',').map(function(s){return s.trim()}).filter(String) : []
                    };
                    duLieuCauHinh.MA_TRAN_PHAN_QUYEN[dinhDanh] = objQuyen;
                    
                    var dDanhLC = dinhDanh.toLowerCase();
                    if (dDanhLC === '*' || dDanhLC.indexOf('công khai') !== -1 || dDanhLC.indexOf('congkhai') !== -1) {
                        duLieuCauHinh.QUYEN_CONG_KHAI = objQuyen;
                    }
                }
            }
        }

        // Đẩy lên bộ nhớ đệm (Thời gian sống: 300 giây = 5 phút)
        var jsonString = JSON.stringify(duLieuCauHinh);
        var chunkSize = 90000;
        var totalChunks = Math.ceil(jsonString.length / chunkSize);
        
        cache.put(cacheKey + "_count", totalChunks.toString(), 300); 
        for (var idx = 0; idx < totalChunks; idx++) {
            cache.put(cacheKey + "_" + idx, jsonString.substring(idx * chunkSize, (idx + 1) * chunkSize), 300);
        }
    }

    return duLieuCauHinh;
}

function docDanhMucLop() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('DM_LOP');
  var mang = trang ? trang.getDataRange().getValues() : [];
  var kq = []; for (var i = 1; i < mang.length; i++) if (mang[i][0]) kq.push(mang[i][0].toString().trim()); return kq;
}

function docDanhSachGiaoVien() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('DM_GIAOVIEN');
  var mang = trang ? trang.getDataRange().getValues() : [];
  var kq = [];
  for (var i = 1; i < mang.length; i++) {
    if (mang[i][0]) {
      var ma = mang[i][0].toString().trim();
      if (ma && kq.indexOf(ma) === -1) kq.push(ma);
    }
  }
  return kq;
}

function docDanhSachMonHoc() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('KHUNG_CHUONG_TRINH');
  var mang = trang ? trang.getDataRange().getValues() : [];
  var kq = [];
  for (var i = 1; i < mang.length; i++) {
    if (mang[i][0]) {
      var m = mang[i][0].toString().trim();
      if (m && m.toLowerCase() !== 'môn học' && m !== '---' && kq.indexOf(m) === -1) kq.push(m);
    }
  }
  return kq;
}

function docPhanCong() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('PHAN_CONG');
  var mang = trang ? trang.getDataRange().getValues() : [];
  var kq = {}; if (mang.length < 2) return kq;
  var tieuDe = mang[0]; 
  for (var i = 1; i < mang.length; i++) {
    var lop = mang[i][0] ? mang[i][0].toString().trim() : '';
    if (!lop) continue; kq[lop] = {};
    for (var j = 1; j < tieuDe.length; j++) {
      var mon = tieuDe[j] ? tieuDe[j].toString().trim() : '';
      var gv = mang[i][j] ? mang[i][j].toString().trim() : '';
      if (mon && gv) kq[lop][mon] = gv;
    }
  } return kq;
}

function docKhungChuongTrinh() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('KHUNG_CHUONG_TRINH');
  var mang = trang ? trang.getDataRange().getValues() : [];
  var kq = {}; if (mang.length < 2) return kq;
  var tieuDe = mang[0]; 
  for (var i = 1; i < mang.length; i++) {
    var mon = mang[i][0] ? mang[i][0].toString().trim() : '';
    if (!mon) continue;
    for (var j = 1; j < tieuDe.length; j++) {
      var khoi = tieuDe[j] ? tieuDe[j].toString().trim() : '';
      var tiet = parseInt(mang[i][j]) || 0;
      if (khoi) { if (!kq[khoi]) kq[khoi] = {}; kq[khoi][mon] = tiet; }
    }
  } return kq;
}

// =========================================================================
// [NÂNG CẤP]: ĐỌC DỮ LIỆU TKB (BẢO VỆ ĐỊNH DẠNG NGÀY CỘT K)
// =========================================================================
function docDuLieuTKB(tuanLoc, nguonTruyXuat, namHocLoc) {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var tenSheet = nguonTruyXuat ? String(nguonTruyXuat).trim() : 'TKB_HIEN_TAI';
  var locStr = tuanLoc ? String(tuanLoc).trim() : '';
  var locSoStr = locStr.replace(/\D/g, '');
  var namHocDung = namHocLoc ? String(namHocLoc).trim() : layNamHocHienTai(ss);

  // [TỐI ƯU CACHE MÁY CHỦ CHO TUẦN CŨ]: Nếu truy xuất tuần quá khứ (DATA_TKB) cụ thể, ưu tiên đọc từ CacheService (< 5ms)
  var cache = CacheService.getScriptCache();
  var verCache = cache.get("VER_TKB_CACHE") || "1";
  var cacheKeyTkb = (tenSheet === 'DATA_TKB' && locSoStr !== '') ? ("CACHE_DOC_TKB_V2_" + verCache + "_" + namHocDung + "_" + locSoStr) : "";
  if (cacheKeyTkb !== "") {
    try {
      var cachedJson = cache.get(cacheKeyTkb);
      if (cachedJson) {
        return JSON.parse(cachedJson);
      }
    } catch (eCache) {}
  }

  if (tenSheet === 'TKB_HIEN_TAI') {
    damBaoTkbHienTaiKhiTrong(ss);
  }
  var trang = ss.getSheetByName(tenSheet);
  var ds = [];

  function chuanHoaNgayNhanh(dispVal) {
      var s = dispVal ? String(dispVal).trim() : '';
      if (!s || s === '--' || s === '--/--/----') return '';
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
      var d = parseNgayTkbAnToan(null, s);
      if (d) return dinhDangThongTinNgay(d).dmy;
      return s;
  }

  if (trang) {
    var lr = trang.getLastRow();
    if (lr > 1) {
        var soCotDoc = Math.max(trang.getLastColumn(), 12);
        // Chỉ gọi getDisplayValues() đúng 1 lần duy nhất thay vì gọi kép cả getValues() + getDisplayValues()
        var disp = trang.getRange(1, 1, lr, soCotDoc).getDisplayValues();
        
        for (var i = 1; i < disp.length; i++) {
          if (disp[i][0] === 'Mã Tiết' || disp[i][0] === '') continue; 
          
          if (tenSheet === 'TKB_CoDinh') {
              var tienToBuoi = (disp[i][4] === "Sáng") ? "S" : "C";
              var nhDong = disp[i][1] || namHocDung;
              var maTietAo = nhDong + "_" + locStr + "_" + disp[i][3] + "_" + tienToBuoi + "_" + disp[i][5] + "_" + disp[i][6];
              ds.push({ 
                  maTiet: maTietAo, namHoc: nhDong, tuan: locStr, thu: disp[i][3], 
                  buoi: disp[i][4], tiet: disp[i][5], maLop: disp[i][6], monHoc: disp[i][7], 
                  maGv: disp[i][8], thang: '', ngay: '', tietPpc: disp[i][11] ? String(disp[i][11]).trim() : ''
              });
          } else {
              var tuanStr = disp[i][2] ? String(disp[i][2]).trim() : '';
              var khopTuan = (locStr === '' || tuanStr === locStr || (locSoStr !== '' && tuanStr.replace(/\D/g, '') === locSoStr) || tenSheet === 'TKB_HIEN_TAI');
              
              // [TỐI ƯU KHOA HỌC]: Lọc tuần và năm học TRƯỚC khi chuẩn hóa ngày tháng để bỏ qua 95% số dòng không thuộc tuần đang xem
              if (khopTuan) {
                  var nhDong = disp[i][1] ? String(disp[i][1]).trim() : '';
                  if (tenSheet === 'DATA_TKB' && namHocDung !== '' && nhDong !== '' && nhDong !== namHocDung) {
                      continue;
                  }
                  var ngayStr = chuanHoaNgayNhanh(disp[i][10]); // Cột K (Index 10)
                  var col12Val = (disp[i].length > 11 && disp[i][11]) ? String(disp[i][11]).trim() : '';
                  ds.push({ 
                      maTiet: disp[i][0], namHoc: nhDong || namHocDung, tuan: tuanStr || locStr || '1', thu: disp[i][3], 
                      buoi: disp[i][4], tiet: disp[i][5], maLop: disp[i][6], monHoc: disp[i][7], 
                      maGv: disp[i][8], thang: (disp[i][9] ? String(disp[i][9]).trim() : ''), ngay: ngayStr,
                      trangThai: col12Val,
                      tietPpc: col12Val
                  });
              }
          }
        }
    }
  }
  
  if (ds.length === 0 && tenSheet === 'TKB_HIEN_TAI') {
      var trangCoDinh = ss.getSheetByName('TKB_CoDinh');
      if (trangCoDinh) {
          var lrCD = trangCoDinh.getLastRow();
          if (lrCD > 1) {
              var mangCD = trangCoDinh.getRange(1, 1, lrCD, 11).getDisplayValues(); 
              var tuanFallback = locStr || '1';
              for (var j = 1; j < mangCD.length; j++) {
                  if (mangCD[j][0] === 'Mã Tiết' || mangCD[j][0] === '') continue;
                  var tienToB = (mangCD[j][4] === "Sáng") ? "S" : "C";
                  var nhDongCD = mangCD[j][1] || namHocDung;
                  var maTietCD = nhDongCD + "_" + tuanFallback + "_" + mangCD[j][3] + "_" + tienToB + "_" + mangCD[j][5] + "_" + mangCD[j][6];

                  ds.push({ 
                      maTiet: maTietCD, namHoc: nhDongCD, tuan: tuanFallback, thu: mangCD[j][3], 
                      buoi: mangCD[j][4], tiet: mangCD[j][5], maLop: mangCD[j][6], monHoc: mangCD[j][7], 
                      maGv: mangCD[j][8], thang: '', ngay: '' 
                  });
              }
              boSungNgayThangDayDuChoTKB(ds, ss, tuanFallback);
          }
      }
  } else if (tenSheet === 'TKB_HIEN_TAI' && ds.length > 0) {
      boSungNgayThangDayDuChoTKB(ds, ss, ds[0].tuan || locStr || '1');
  }

  if (cacheKeyTkb !== "" && ds.length > 0) {
      try {
          var strCache = JSON.stringify(ds);
          if (strCache.length < 95000) {
              cache.put(cacheKeyTkb, strCache, 1800);
          }
      } catch (ePut) {}
  }

  return ds;
}

function layDuLieuKhoiTao() {
  const ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  
  const shKhung = ss.getSheetByName('KHUNG_CHUONG_TRINH');
  const duLieuKhung = shKhung.getRange('A2:A' + shKhung.getLastRow()).getValues();
  const danhSachMon = duLieuKhung.flat().filter(String); 

  const shGiaoVien = ss.getSheetByName('DM_GIAOVIEN');
  const duLieuGiaoVien = shGiaoVien.getRange('A2:D' + shGiaoVien.getLastRow()).getValues();
  
  const thongTinGiaoVien = duLieuGiaoVien
    .filter(row => row[0] !== '')
    .map(row => ({
      maGv: row[0],
      hoTen: row[1],
      dinhMuc: row[3] || 0
    }));

  const shLop = ss.getSheetByName('DM_LOP');
  const duLieuLop = shLop.getRange('A2:A' + shLop.getLastRow()).getValues();
  const danhSachLop = duLieuLop.flat().filter(String);

  const shPhanCong = ss.getSheetByName('PHAN_CONG');
  let duLieuPhanCong = [];
  if (shPhanCong.getLastRow() > 0) {
    duLieuPhanCong = shPhanCong.getDataRange().getValues();
  }

  const khungCT = docKhungChuongTrinh();

  return { monHoc: danhSachMon, giaoVien: thongTinGiaoVien, maLop: danhSachLop, phanCong: duLieuPhanCong, khungChuongTrinh: khungCT };
}

// =========================================================================
// KHỐI 3: THUẬT TOÁN ĐỘNG CƠ XẾP LỊCH KIÊN CỐ (PHIÊN BẢN NÂNG CẤP HOÀN CHỈNH)
// Tích hợp kiểm soát 4 hàm:
// 1. [NÂNG CẤP HÀM 1 - getThuTu]: Phân cấp thứ tự ưu tiên gắp môn học khoa học
// 2. [NÂNG CẤP HÀM 2 - addSlot]: Khởi tạo ma trận Slot học động liên cấp theo CAI_DAT
// 3. [NÂNG CẤP HÀM 3 - laTietCam]: Hàng rào kiểm soát tiết cấm kiên cố, độc quyền & đa cấp học
// 4. [NÂNG CẤP HÀM 4 - khoiTaoLichTuDong]: Động cơ phân bổ 4 vòng & sửa lỗi dồn tiết (Compaction)
// =========================================================================
function khoiTaoLichTuDong(tuanHienTai) {
    // 1. Nạp cấu hình hệ thống và dữ liệu học vụ
    var cauHinh = docBangCauHinh();
    var pCong = docPhanCong();
    var khung = docKhungChuongTrinh();
    var dsLop = docDanhMucLop();

    // Giới hạn số tiết cấu hình theo cấp học (Mặc định chuẩn Bộ GD&ĐT)
    var soTietSangTH = parseInt(cauHinh.SO_TIET_SANG_TH) || 4;
    var soTietChieuTH = parseInt(cauHinh.SO_TIET_CHIEU_TH) || 3;
    var soTietSangTHCS = parseInt(cauHinh.SO_TIET_SANG_THCS) || 5;
    var soTietChieuTHCS = parseInt(cauHinh.SO_TIET_CHIEU_THCS) || 3;

    // Trích xuất từ khóa ưu tiên trong Khung chương trình
    var keyUuTien = "";
    for (var k in khung) {
        var kNorm = k.toLowerCase().replace(/\s+/g, '');
        if (kNorm.indexOf("ưutiên") !== -1 || kNorm.indexOf("uutien") !== -1) {
            keyUuTien = k; break;
        }
    }
    var uuTienMon = keyUuTien ? khung[keyUuTien] : {};

    var tkGV_SoLopDay = {};
    var tkGV_TongTiet = {};
    var allMonChinh = [];
    var tongTietCuaLop = {};
    var maxPeriodsToanTruong = 0;
    var lichBanGV = {}; 

    // Phân tích nhu cầu tiết dạy của từng lớp
    for (var l = 0; l < dsLop.length; l++) {
        var lop = dsLop[l];
        var pcLop = pCong[lop] || {};
        var kKhoi = khung[lop] || {}; 
        var tTietLop = 0;

        for (var mon in kKhoi) {
            var soTiet = parseInt(kKhoi[mon]) || 0;
            if (soTiet > 0) {
                tTietLop += soTiet;
                var gv = pcLop[mon] || "";
                if (gv) {
                    if (!tkGV_SoLopDay[gv]) tkGV_SoLopDay[gv] = {};
                    tkGV_SoLopDay[gv][lop] = true;
                    tkGV_TongTiet[gv] = (tkGV_TongTiet[gv] || 0) + soTiet;
                    if (!lichBanGV[gv]) lichBanGV[gv] = {}; 
                }
                var prio = parseInt(uuTienMon[mon]) || 99;
                for (var i = 0; i < soTiet; i++) {
                    allMonChinh.push({lop: lop, mon: mon, gv: gv, uuTien: prio, tongTietMon: soTiet});
                }
            }
        }
        tongTietCuaLop[lop] = tTietLop;
        if (tTietLop > maxPeriodsToanTruong) maxPeriodsToanTruong = tTietLop;
    }

    // =====================================================================
    // [NÂNG CẤP HÀM 1]: getThuTu - Phân cấp thứ tự ưu tiên gắp môn học
    // =====================================================================
    function getThuTu(ut) {
        var u = parseInt(ut);
        if (isNaN(u)) return 99;
        if (u === 1) return 1; // Ưu tiên 1 (Chào cờ/HĐTN đầu tuần): Xếp đầu tiên
        if (u === 6) return 2; // Ưu tiên 6 (Sinh hoạt lớp/HĐTN cuối tuần): Đặc cách xếp thứ 2
        if (u === 2) return 3; // Ưu tiên 2 (Toán, Tiếng Việt/Ngữ văn): Xếp thứ 3
        if (u === 3) return 4; // Ưu tiên 3 (Ngoại ngữ, KHTN, Lịch sử & Địa lý): Xếp thứ 4
        if (u === 4) return 5; // Ưu tiên 4 (Tin học, Công nghệ, GDTC, Mĩ thuật, Âm nhạc): Xếp thứ 5
        if (u === 5) return 6; // Ưu tiên 5 (Đạo đức, KNS, Hoạt động phụ): Xếp thứ 6
        return u + 2;          // Các môn khác và môn tăng cường: Xếp sau
    }

    // Sắp xếp bài dạy: Ưu tiên môn -> Khối lượng tiết GV -> Số lớp GV -> Lớp -> Môn
    allMonChinh.sort(function(a, b) {
        var rankA = getThuTu(a.uuTien);
        var rankB = getThuTu(b.uuTien);
        if (rankA !== rankB) return rankA - rankB;

        var tongA = tkGV_TongTiet[a.gv] || 0;
        var tongB = tkGV_TongTiet[b.gv] || 0;
        if (tongA !== tongB) return tongB - tongA;

        var spreadA = tkGV_SoLopDay[a.gv] ? Object.keys(tkGV_SoLopDay[a.gv]).length : 0;
        var spreadB = tkGV_SoLopDay[b.gv] ? Object.keys(tkGV_SoLopDay[b.gv]).length : 0;
        if (spreadA !== spreadB) return spreadB - spreadA;

        if (a.lop !== b.lop) return a.lop.localeCompare(b.lop);
        return a.mon.localeCompare(b.mon);
    });

    var dsSlotGoc = [];
    var thuHoc = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
    var slotDaThem = {};
    var doLechThu = {"Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5};

    // =====================================================================
    // [NÂNG CẤP HÀM 2]: addSlot - Khởi tạo ma trận Slot học linh hoạt liên cấp
    // =====================================================================
    function addSlot(d, buoi, t) {
        var key = thuHoc[d] + "_" + buoi + "_" + t;
        if (!slotDaThem[key]) {
            var scoreSang = (buoi === "Sáng" ? 0 : 1000) + t * 10 + doLechThu[thuHoc[d]];
            var scoreChieu = (buoi === "Chiều" ? 0 : 1000) + t * 10 + doLechThu[thuHoc[d]];
            dsSlotGoc.push({thu: thuHoc[d], buoi: buoi, tiet: t, key: key, scoreSang: scoreSang, scoreChieu: scoreChieu});
            slotDaThem[key] = true;
        }
    }

    var maxTietSang = Math.max(soTietSangTH, soTietSangTHCS, 5);
    var maxTietChieu = Math.max(soTietChieuTH, soTietChieuTHCS, 4);

    // 1. Phân bổ các slot vàng buổi sáng (Tiết 1 -> 4 cho T2..T6)
    for (var t = 1; t <= 4; t++) { 
        for (var d = 0; d < 5; d++) addSlot(d, "Sáng", t); 
    }
    // 2. Phân bổ các slot buổi chiều chuẩn (Tiết 1 -> 3 cho T2..T5)
    for (var d = 0; d < 4; d++) { 
        for (var t = 1; t <= Math.min(soTietChieuTH, 3); t++) addSlot(d, "Chiều", t); 
    }
    // 3. Phân bổ slot buổi sáng mở rộng (Tiết 5 cho các khối THCS hoặc mở rộng)
    for (var t = 5; t <= maxTietSang; t++) { 
        for (var d = 0; d < 5; d++) addSlot(d, "Sáng", t); 
    }
    // 4. Phân bổ slot buổi chiều mở rộng (Tiết 4 cho T2..T5)
    for (var t = 4; t <= maxTietChieu; t++) { 
        for (var d = 0; d < 4; d++) addSlot(d, "Chiều", t); 
    }
    // 5. Phân bổ slot chiều Thứ 6 (nếu cấp học có lịch chiều)
    for (var t = 1; t <= maxTietChieu; t++) { 
        addSlot(4, "Chiều", t); 
    }

    var dsSlotToanTruong = dsSlotGoc.slice(0, maxPeriodsToanTruong);
    for (var i = 0; i < dsSlotToanTruong.length; i++) { dsSlotToanTruong[i].indexTruong = i; }

    var slotUuTienSang = dsSlotToanTruong.slice().sort(function(a, b) { return a.scoreSang - b.scoreSang; });
    var slotUuTienChieu = dsSlotToanTruong.slice().sort(function(a, b) { return a.scoreChieu - b.scoreChieu; });

    var TKB = {}; 
    var demMonTrongNgay = {};
    for (var l = 0; l < dsLop.length; l++) TKB[dsLop[l]] = {};

    // =====================================================================
    // [NÂNG CẤP HÀM 3]: laTietCam - Hàng rào kiểm soát tiết cấm kiên cố & đa cấp học
    // =====================================================================
    function laTietCam(uuTien, buoi, tiet, thu, tenLop, monHoc) {
        var ut = parseInt(uuTien);
        if (isNaN(ut)) ut = 99;
        
        var matchKhoi = tenLop ? String(tenLop).match(/\d+/) : null;
        var khoiLop = matchKhoi ? parseInt(matchKhoi[0], 10) : 0;
        var laCapTHCS = (khoiLop >= 6 && khoiLop <= 9);
        var soTietSangLop = laCapTHCS ? soTietSangTHCS : soTietSangTH;
        var soTietChieuLop = laCapTHCS ? soTietChieuTHCS : soTietChieuTH;
        var tietUuTien6 = soTietSangLop; // Tiết cuối buổi sáng Thứ 6 (Tiết 4 với Tiểu học, Tiết 5 với THCS)

        // 1. Khống chế trần số tiết tối đa theo từng cấp học (Dựa vào CAI_DAT)
        if (buoi === "Sáng" && tiet > soTietSangLop) return true;
        if (buoi === "Chiều" && tiet > soTietChieuLop) return true;

        // 2. Khống chế buổi nghỉ quy định của Tiểu học: Chiều Thứ 6 nghỉ
        if (!laCapTHCS && thu === "Thứ 6" && buoi === "Chiều") return true;

        // 3. Hàng rào bảo vệ độc quyền Ưu tiên 1 (Chào cờ: Tiết 1 Sáng Thứ 2)
        if (ut !== 1 && thu === "Thứ 2" && buoi === "Sáng" && tiet === 1) return true;
        if (ut === 1) {
            if (thu !== "Thứ 2" || buoi !== "Sáng" || tiet !== 1) return true;
            return false;
        }

        // 4. Hàng rào bảo vệ độc quyền Ưu tiên 6 (Sinh hoạt lớp: Tiết cuối sáng Thứ 6)
        if (ut !== 6 && thu === "Thứ 6" && buoi === "Sáng" && tiet === tietUuTien6) return true;
        if (ut === 6) {
            if (thu !== "Thứ 6" || buoi !== "Sáng" || tiet !== tietUuTien6) return true;
            return false;
        }

        // 5. Khống chế sư phạm cho môn thể dục (GDTC): Tránh tiết 5 sáng và tiết 1 chiều nắng gắt
        var monStr = String(monHoc || '').toLowerCase();
        if (monStr.indexOf("gdtc") !== -1 || monStr.indexOf("thể dục") !== -1) {
            if (buoi === "Sáng" && tiet >= 5) return true;
            if (buoi === "Chiều" && tiet === 1) return true;
        }

        // 6. Khống chế các môn ưu tiên >= 4 không vào các tiết đầu buổi
        if (ut >= 4) {
            if (buoi === "Sáng" && (tiet === 1 || tiet === 2)) return true;
            if (buoi === "Chiều" && tiet === 1) return true;
        }
        return false;
    }

    // =====================================================================
    // [NÂNG CẤP HÀM 4]: khoiTaoLichTuDong - Điều phối xếp lịch 4 vòng & Dồn tiết
    // =====================================================================
    for (var i = 0; i < allMonChinh.length; i++) {
        var bai = allMonChinh[i]; 
        var placed = false;
        var gv = bai.gv;
        var lop = bai.lop;
        
        var sortedSlots;
        if (bai.uuTien === 1 || bai.uuTien === 6) {
            sortedSlots = dsSlotGoc; 
        } else {
            sortedSlots = (bai.uuTien <= 2) ? slotUuTienSang : slotUuTienChieu;
        }
        
        var sortedSlotsHople = [];
        for (var sx = 0; sx < sortedSlots.length; sx++) {
            if (!laTietCam(bai.uuTien, sortedSlots[sx].buoi, sortedSlots[sx].tiet, sortedSlots[sx].thu, lop, bai.mon)) {
                sortedSlotsHople.push(sortedSlots[sx]);
            }
        }

        var limitNgay = Math.ceil(bai.tongTietMon / 5);

        // Vòng 1: Rải đều sư phạm
        for (var s = 0; s < sortedSlotsHople.length; s++) {
            var sl = sortedSlotsHople[s];
            if (sl.indexTruong >= tongTietCuaLop[lop] && bai.uuTien !== 1 && bai.uuTien !== 6) continue;

            var dayKey = lop + "_" + bai.mon + "_" + sl.thu;
            if (!TKB[lop][sl.key] && (!gv || !lichBanGV[gv][sl.key] || bai.uuTien === 1 || bai.uuTien === 6)) {
                if ((demMonTrongNgay[dayKey] || 0) < limitNgay) { 
                    TKB[lop][sl.key] = bai; 
                    if (gv) lichBanGV[gv][sl.key] = true; 
                    demMonTrongNgay[dayKey] = (demMonTrongNgay[dayKey] || 0) + 1; 
                    placed = true; 
                    break; 
                }
            }
        }
        
        // Vòng 2: Nhồi bất kỳ vào slot hợp lệ
        if (!placed) {
            for (var s = 0; s < sortedSlotsHople.length; s++) {
                var sl = sortedSlotsHople[s];
                if (sl.indexTruong >= tongTietCuaLop[lop] && bai.uuTien !== 1 && bai.uuTien !== 6) continue;
                
                if (!TKB[lop][sl.key] && (!gv || !lichBanGV[gv][sl.key] || bai.uuTien === 1 || bai.uuTien === 6)) { 
                    TKB[lop][sl.key] = bai; 
                    if (gv) lichBanGV[gv][sl.key] = true; 
                    placed = true; 
                    break; 
                }
            }
        }

        // Vòng 3: Hoán đổi thông minh (Swap)
        if (!placed) {
            var dsTrong = dsSlotToanTruong.slice(0, tongTietCuaLop[lop]).filter(function(x) { 
                return !TKB[lop][x.key] && !laTietCam(bai.uuTien, x.buoi, x.tiet, x.thu, lop, bai.mon); 
            });
            for (var s = 0; s < tongTietCuaLop[lop]; s++) {
                var sl = dsSlotToanTruong[s];
                if (laTietCam(bai.uuTien, sl.buoi, sl.tiet, sl.thu, lop, bai.mon)) continue; 

                if (TKB[lop][sl.key] && (!gv || !lichBanGV[gv][sl.key] || gv === TKB[lop][sl.key].gv)) {
                    var monCu = TKB[lop][sl.key];
                    // Tuyệt đối không hoán đổi slot của Ưu tiên 1 và Ưu tiên 6
                    if (monCu.uuTien === 1 || monCu.uuTien === 6) continue;

                    var gvCu = monCu.gv;
                    for (var y = 0; y < dsTrong.length; y++) {
                        var slEmpty = dsTrong[y];
                        if (laTietCam(monCu.uuTien, slEmpty.buoi, slEmpty.tiet, slEmpty.thu, lop, monCu.mon)) continue;

                        if (!gvCu || !lichBanGV[gvCu][slEmpty.key]) {
                            TKB[lop][slEmpty.key] = monCu;
                            if (gvCu) { lichBanGV[gvCu][slEmpty.key] = true; } 
                            
                            TKB[lop][sl.key] = bai;
                            if (gv && gv !== gvCu) {
                                lichBanGV[gv][sl.key] = true; 
                                if (gvCu) lichBanGV[gvCu][sl.key] = false; 
                            }
                            placed = true; break;
                        }
                    }
                }
                if (placed) break;
            }
        }

        // Vòng 4: Quét toàn bộ slot gốc hợp lệ
        if (!placed) {
            for (var s = 0; s < dsSlotGoc.length; s++) {
                var sl = dsSlotGoc[s];
                if (laTietCam(bai.uuTien, sl.buoi, sl.tiet, sl.thu, lop, bai.mon)) continue;
                
                if (!TKB[lop][sl.key] && (!gv || !lichBanGV[gv][sl.key] || bai.uuTien === 1 || bai.uuTien === 6)) {
                    TKB[lop][sl.key] = bai;
                    if (gv) lichBanGV[gv][sl.key] = true;
                    placed = true; break;
                }
            }
        }
    } 

    // Dồn tiết lên trên (Compaction) - Khắc phục triệt để lỗi đồng bộ key và giới hạn tiết theo cấp học
    for (var l = 0; l < dsLop.length; l++) {
        var lop = dsLop[l];
        var mKhoiLop = lop ? String(lop).match(/\d+/) : null;
        var khoiNum = mKhoiLop ? parseInt(mKhoiLop[0], 10) : 0;
        var isCap2 = (khoiNum >= 6 && khoiNum <= 9);
        var curMaxSang = isCap2 ? soTietSangTHCS : soTietSangTH;
        var curMaxChieu = isCap2 ? soTietChieuTHCS : soTietChieuTH;

        for (var d = 0; d < 5; d++) {
            var thu = thuHoc[d];
            // Dồn tiết buổi Sáng
            for (var pass = 0; pass < curMaxSang - 1; pass++) {
                for (var t = 1; t < curMaxSang; t++) {
                    var k1 = thu + "_Sáng_" + t; 
                    var k2 = thu + "_Sáng_" + (t + 1);
                    if (!TKB[lop][k1] && TKB[lop][k2]) {
                        var monDich = TKB[lop][k2];
                        if (!laTietCam(monDich.uuTien, "Sáng", t, thu, lop, monDich.mon)) {
                            var gv = monDich.gv;
                            if (!gv || !lichBanGV[gv][k1]) {
                                TKB[lop][k1] = TKB[lop][k2]; 
                                delete TKB[lop][k2];
                                if (gv) { 
                                    lichBanGV[gv][k1] = true; 
                                    lichBanGV[gv][k2] = false; 
                                }
                            }
                        }
                    }
                }
            }
            // Dồn tiết buổi Chiều (Tiểu học bỏ qua chiều Thứ 6)
            if (isCap2 || thu !== "Thứ 6") {
                for (var pass = 0; pass < curMaxChieu - 1; pass++) {
                    for (var t = 1; t < curMaxChieu; t++) { 
                        var k1 = thu + "_Chiều_" + t; 
                        var k2 = thu + "_Chiều_" + (t + 1);
                        if (!TKB[lop][k1] && TKB[lop][k2]) {
                            var monDich = TKB[lop][k2];
                            if (!laTietCam(monDich.uuTien, "Chiều", t, thu, lop, monDich.mon)) {
                                var gv = monDich.gv;
                                if (!gv || !lichBanGV[gv][k1]) {
                                    TKB[lop][k1] = TKB[lop][k2]; 
                                    delete TKB[lop][k2];
                                    if (gv) { 
                                        lichBanGV[gv][k1] = true; 
                                        lichBanGV[gv][k2] = false; 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    var kq = [];
    for (var s = 0; s < dsSlotGoc.length; s++) {
        var sl = dsSlotGoc[s];
        var tienTo = (sl.buoi === "Sáng") ? "S" : "C";
        for (var l = 0; l < dsLop.length; l++) {
            var lop = dsLop[l];
            var bai = TKB[lop][sl.key]; 
            if (bai) {
                var ma = tuanHienTai + "_" + sl.thu + "_" + tienTo + "_" + sl.tiet + "_" + lop;
                kq.push({ maTiet: ma, tuan: tuanHienTai, thu: sl.thu, buoi: sl.buoi, tiet: sl.tiet, maLop: lop, monHoc: bai.mon, maGv: bai.gv }); 
            }
        }
    } 
    return kq;
}

// =========================================================================
// HÀM MÁY CHỦ: GHI CHỐT TKB ĐỊNH TUYẾN 
// =========================================================================
function xuLyLuuDuLieu(duLieuNhan) {
    var khoaHeThong = LockService.getScriptLock();
    try {
        khoaHeThong.waitLock(15000);
        var loaiLuu = duLieuNhan.loaiLuu; 
        var dsTiet = duLieuNhan.duLieu;
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        
        var tieuDeChuan = ['Mã Tiết', 'Năm học', 'Tuần', 'Thứ', 'Buổi', 'Tiết', 'Mã Lớp', 'Môn Học', 'Mã GV', 'Tháng', 'Ngày', 'Trạng thái'];
        var soCotChuan = tieuDeChuan.length; 
        
        // 1. NHÁNH LƯU CỐ ĐỊNH (TKB_CoDinh)
        if (loaiLuu === 'codinh') {
            var trangCoDinh = ss.getSheetByName('TKB_CoDinh');
            if (!trangCoDinh) { trangCoDinh = ss.insertSheet('TKB_CoDinh'); }
            var lastRowCD = trangCoDinh.getLastRow();
            var mangGhi = [tieuDeChuan];
            
            if (dsTiet && dsTiet.length > 0) {
                for(var i = 0; i < dsTiet.length; i++){
                    var t = dsTiet[i];
                    if (t.monHoc && String(t.monHoc).trim() !== '') {
                        var tienToBuoi = (t.buoi === "Sáng") ? "S" : "C";
                        var maTietMoi = 'CD_' + t.thu + '_' + tienToBuoi + '_' + t.tiet + '_' + t.maLop; 
                        mangGhi.push([maTietMoi, t.namHoc, 'Cố định', t.thu, t.buoi, t.tiet, t.maLop, t.monHoc, t.maGv, '', '', t.trangThai || t.ghiChu || '']);
                    }
                }
            }
            if (mangGhi.length > 0) {
                trangCoDinh.getRange(1, 1, mangGhi.length, soCotChuan).setValues(mangGhi);
                if (lastRowCD > mangGhi.length) trangCoDinh.getRange(mangGhi.length + 1, 1, lastRowCD - mangGhi.length, soCotChuan).clearContent();
            }
            SpreadsheetApp.flush();
            return { trangThai: 'thanh_cong' };
        }
        
        // 2. NHÁNH LƯU TUẦN VÀ CHUYỂN TUẦN ĐỊNH TUYẾN
        if (loaiLuu === 'tuan' || loaiLuu === 'khoiphuc') {
            var tuanLuu = (dsTiet && dsTiet.length > 0) ? parseInt(dsTiet[0].tuan, 10) : 1;
            var namHocLuu = (dsTiet && dsTiet.length > 0 && dsTiet[0].namHoc) ? String(dsTiet[0].namHoc).trim() : layNamHocHienTai(ss);
            var banDoKhoaTKB = layTrangThaiKhoaTKB(ss, namHocLuu);
            if (banDoKhoaTKB[tuanLuu] && banDoKhoaTKB[tuanLuu].daKhoa) {
                var emailNguoiLuu = duLieuNhan.emailTruyCap || '';
                if (!kiemTraQuyenKhoaTKB(emailNguoiLuu)) {
                    return { trangThai: 'that_bai', thongBao: 'Thời khóa biểu Tuần ' + tuanLuu + ' đã bị KHÓA. Chỉ người có quyền mới được phép mở khóa để lưu!' };
                }
            }
            var tuanLuu = (dsTiet && dsTiet.length > 0) ? parseInt(dsTiet[0].tuan, 10) : 1;
            
            var tuanHeThong = 1;
            var trangHT_Temp = ss.getSheetByName('TKB_HIEN_TAI');
            if (trangHT_Temp && trangHT_Temp.getLastRow() > 1) {
                var valTuan = trangHT_Temp.getRange(2, 3).getValue();
                if (valTuan) tuanHeThong = parseInt(valTuan, 10);
            }

            if (loaiLuu === 'khoiphuc') {
                var trangData = ss.getSheetByName('DATA_TKB');
                if (!trangData) { trangData = ss.insertSheet('DATA_TKB'); }
                var lastRowData = trangData.getLastRow();
                var mangGhiData = [tieuDeChuan];
                
                var namHocLuuKP = (dsTiet && dsTiet.length > 0 && dsTiet[0].namHoc) ? String(dsTiet[0].namHoc).trim() : layNamHocHienTai(ss);
                if (lastRowData > 1) {
                    var dataCu = trangData.getRange(1, 1, lastRowData, soCotChuan).getValues();
                    for (var i = 1; i < dataCu.length; i++) {
                        var tuanDong = parseInt(String(dataCu[i][2]).replace(/\D/g, ''), 10);
                        var nhDong = String(dataCu[i][1] || '').trim();
                        // [CÁCH LY ĐA NĂM HỌC]: Chỉ lọc bỏ tuần của đúng năm học này, bảo toàn tuyệt đối các năm học khác
                        if (tuanDong !== tuanLuu || (nhDong !== '' && namHocLuuKP !== '' && nhDong !== namHocLuuKP)) {
                            mangGhiData.push(dataCu[i]);
                        }
                    }
                }
                
                boSungNgayThangDayDuChoTKB(dsTiet, ss, tuanLuu);

                for (var j = 0; j < dsTiet.length; j++) {
                    var tj = dsTiet[j];
                    if (tj.monHoc && String(tj.monHoc).trim() !== '') {
                        mangGhiData.push([tj.maTiet, tj.namHoc, tj.tuan, tj.thu, tj.buoi, tj.tiet, tj.maLop, tj.monHoc, tj.maGv, tj.thang || '', tj.ngay || '', tj.trangThai || tj.ghiChu || '']);
                    }
                }
                
                trangData.getRange(1, 1, mangGhiData.length, soCotChuan).setValues(mangGhiData);
                if (lastRowData > mangGhiData.length) trangData.getRange(mangGhiData.length + 1, 1, lastRowData - mangGhiData.length, soCotChuan).clearContent();
                
                var lastRowHT = trangHT_Temp.getLastRow();
                trangHT_Temp.getRange(1, 1, 1, soCotChuan).setValues([tieuDeChuan]);
                if (lastRowHT > 1) trangHT_Temp.getRange(2, 1, lastRowHT - 1, soCotChuan).clearContent();
            } 
            else if (loaiLuu === 'tuan') {
                tuanLuu = parseInt(duLieuNhan.tuan, 10) || ((dsTiet && dsTiet.length > 0) ? parseInt(dsTiet[0].tuan, 10) : 1) || 1;
                boSungNgayThangDayDuChoTKB(dsTiet, ss, tuanLuu);

                if (!trangHT_Temp) {
                    trangHT_Temp = ss.insertSheet('TKB_HIEN_TAI');
                }

                // Nếu trước khi lưu tuần mới (tuanLuu > tuanHeThong), trên TKB_HIEN_TAI đang có dữ liệu của tuần cũ (tuanHeThong),
                // tự động lưu trữ tuần cũ từ TKB_HIEN_TAI sang DATA_TKB để không bị mất lịch sử
                var lastRowHT2 = trangHT_Temp.getLastRow();
                if (lastRowHT2 > 1 && tuanHeThong > 0 && tuanHeThong < tuanLuu) {
                    var dataHienTaiCu = trangHT_Temp.getRange(2, 1, lastRowHT2 - 1, soCotChuan).getValues();
                    var dongHopLeCu = [];
                    for (var rCu = 0; rCu < dataHienTaiCu.length; rCu++) {
                        if (String(dataHienTaiCu[rCu][6] || '').trim() !== '' && String(dataHienTaiCu[rCu][7] || '').trim() !== '') {
                            dongHopLeCu.push(dataHienTaiCu[rCu]);
                        }
                    }
                    if (dongHopLeCu.length > 0) {
                        var trangDataArc = ss.getSheetByName('DATA_TKB');
                        if (!trangDataArc) trangDataArc = ss.insertSheet('DATA_TKB');
                        var lrDataArc = trangDataArc.getLastRow();
                        var mangArc = [tieuDeChuan];
                        if (lrDataArc > 1) {
                            var oldArc = trangDataArc.getRange(1, 1, lrDataArc, soCotChuan).getValues();
                            for (var a = 1; a < oldArc.length; a++) {
                                var tArc = parseInt(String(oldArc[a][2] || '').replace(/\D/g, ''), 10);
                                var nhArc = String(oldArc[a][1] || '').trim();
                                if (tArc !== tuanHeThong || (nhArc !== '' && namHocLuu !== '' && nhArc !== namHocLuu)) {
                                    mangArc.push(oldArc[a]);
                                }
                            }
                        }
                        for (var b = 0; b < dongHopLeCu.length; b++) {
                            mangArc.push(dongHopLeCu[b]);
                        }
                        trangDataArc.getRange(1, 1, mangArc.length, soCotChuan).setValues(mangArc);
                        if (lrDataArc > mangArc.length) {
                            trangDataArc.getRange(mangArc.length + 1, 1, lrDataArc - mangArc.length, soCotChuan).clearContent();
                        }
                    }
                }

                // Gán toàn bộ giá trị trên lưới (kể cả cột ẩn: Mã Tiết, Năm học, Tuần, Thứ, Buổi, Tiết, Mã Lớp, Môn Học, Mã GV, Tháng, Ngày) vào TKB_HIEN_TAI
                var mangGhiTuan = [tieuDeChuan];
                if (dsTiet && dsTiet.length > 0) {
                    for (var k = 0; k < dsTiet.length; k++) {
                        var tk = dsTiet[k];
                        if (tk.monHoc && String(tk.monHoc).trim() !== '') {
                            var nhTk = String(tk.namHoc || namHocLuu).trim();
                            var tienToB = (tk.buoi === "Sáng") ? "S" : "C";
                            var maTietChuan = tk.maTiet ? String(tk.maTiet).trim() : (nhTk + "_" + tuanLuu + "_" + tk.thu + "_" + tienToB + "_" + tk.tiet + "_" + tk.maLop);
                            mangGhiTuan.push([maTietChuan, nhTk, tuanLuu, tk.thu, tk.buoi, tk.tiet, tk.maLop, tk.monHoc, tk.maGv, tk.thang || '', tk.ngay || '', tk.trangThai || tk.ghiChu || '']);
                        }
                    }
                }
                lastRowHT2 = trangHT_Temp.getLastRow();
                if (mangGhiTuan.length > 0) {
                    trangHT_Temp.getRange(1, 1, mangGhiTuan.length, soCotChuan).setValues(mangGhiTuan);
                    if (lastRowHT2 > mangGhiTuan.length) {
                        trangHT_Temp.getRange(mangGhiTuan.length + 1, 1, lastRowHT2 - mangGhiTuan.length, soCotChuan).clearContent();
                    }
                }

                // Đồng bộ TUAN_HIEN_TAI trong CAI_DAT theo tuần vừa lưu vào TKB_HIEN_TAI
                var shCaiDatLuu = ss.getSheetByName('CAI_DAT');
                if (shCaiDatLuu && shCaiDatLuu.getLastRow() > 1) {
                    var dataCDLuu = shCaiDatLuu.getRange(1, 1, shCaiDatLuu.getLastRow(), 2).getDisplayValues();
                    for (var cIdx = 1; cIdx < dataCDLuu.length; cIdx++) {
                        if (String(dataCDLuu[cIdx][0] || '').trim().toUpperCase() === 'TUAN_HIEN_TAI') {
                            shCaiDatLuu.getRange(cIdx + 1, 2).setValue(tuanLuu);
                            break;
                        }
                    }
                }
            }
            
            SpreadsheetApp.flush();
            if (typeof xoaCacheHeThongToanDien === 'function') xoaCacheHeThongToanDien();
            return { trangThai: 'thanh_cong' };
        }
    } catch (loi) {
        if (loi.message.includes('lock') || loi.message.includes('Timeout')) {
            return { trangThai: 'loi_he_thong', thongBao: 'Hệ thống đang xếp hàng lệnh ghi. Vui lòng bấm lưu lại sau giây lát!' };
        }
        return { trangThai: 'loi_he_thong', thongBao: 'Lỗi ghi TKB: ' + loi.toString() };
    } finally {
        khoaHeThong.releaseLock();
    }
}
//==================================================
function luuDuLieuPhanCong(mangDuLieuMoi) {
  var khoaHeThong = LockService.getScriptLock();
  try {
    khoaHeThong.waitLock(15000);
    const ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    const shPhanCong = ss.getSheetByName('PHAN_CONG');
    
    if (mangDuLieuMoi && mangDuLieuMoi.length > 0) {
      const soDongMoi = mangDuLieuMoi.length;
      const soCotMoi = mangDuLieuMoi[0].length;
      const lastRowCu = shPhanCong.getLastRow();
      const lastColCu = shPhanCong.getLastColumn();
      const maxR = Math.max(lastRowCu, soDongMoi);
      const maxC = Math.max(lastColCu, soCotMoi);

      shPhanCong.getRange(1, 1, maxR, maxC).clearDataValidations();
      shPhanCong.getRange(1, 1, soDongMoi, soCotMoi).setValues(mangDuLieuMoi);
      if (lastRowCu > soDongMoi) {
        shPhanCong.getRange(soDongMoi + 1, 1, lastRowCu - soDongMoi, maxC).clearContent();
      }
      if (lastColCu > soCotMoi && lastRowCu > 0) {
        shPhanCong.getRange(1, soCotMoi + 1, maxR, lastColCu - soCotMoi).clearContent();
      }
    } else {
      shPhanCong.clearDataValidations();
      shPhanCong.clearContents();
    }
    SpreadsheetApp.flush();
    
    return {trangThai: 'Thành công', thongBao: 'Đã cập nhật hệ thống phân công giảng dạy.'};
  } catch (error) {
    return {trangThai: 'Lỗi', thongBao: 'Sự cố ghi dữ liệu: ' + error.toString()};
  } finally {
    khoaHeThong.releaseLock();
  }
}

// =========================================================================
// KHỐI 5: CÁC HÀM XỬ LÝ PHÂN HỆ THỐNG KÊ 
// =========================================================================
function docCayQuanHeThongKe() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('DATA_TKB');
  if (!trang) return {};
  
  var mang = trang.getDataRange().getValues();
  var cayDuLieu = {};

  for (var i = 1; i < mang.length; i++) {
    var namHoc = mang[i][1] ? String(mang[i][1]).trim() : '';
    var tuan = mang[i][2] ? parseInt(mang[i][2], 10) : null;
    var thang = mang[i][9] ? String(mang[i][9]).trim() : '';
    var gv = mang[i][8] ? String(mang[i][8]).trim() : '';

    if (!namHoc || !tuan || !thang) continue;

    if (!cayDuLieu[namHoc]) cayDuLieu[namHoc] = { danhSachThang: [], soDoThoiGian: {}, danhSachGiaoVien: [] };
    if (!cayDuLieu[namHoc].soDoThoiGian[thang]) {
      cayDuLieu[namHoc].soDoThoiGian[thang] = [];
      cayDuLieu[namHoc].danhSachThang.push(thang);
    }
    if (cayDuLieu[namHoc].soDoThoiGian[thang].indexOf(tuan) === -1) cayDuLieu[namHoc].soDoThoiGian[thang].push(tuan);
    if (gv && cayDuLieu[namHoc].danhSachGiaoVien.indexOf(gv) === -1) cayDuLieu[namHoc].danhSachGiaoVien.push(gv);
  }

  for (var nam in cayDuLieu) {
    for (var th in cayDuLieu[nam].soDoThoiGian) cayDuLieu[nam].soDoThoiGian[th].sort(function(a, b) { return a - b; });
    cayDuLieu[nam].danhSachGiaoVien.sort();
  }
  return cayDuLieu;
}

function traCuuDuLieuThongKe(namHoc, thang, tuan, giaoVien) {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('DATA_TKB');
  if (!trang) return [];

  var lastRow = trang.getLastRow();
  if (lastRow < 2) return []; 
  var mang = trang.getRange(2, 1, lastRow - 1, 11).getValues(); 

  var fNam = namHoc ? String(namHoc).trim() : null;
  var fThang = thang ? String(thang).trim() : null;
  var fTuan = tuan ? parseInt(tuan, 10) : null;
  var fGv = giaoVien ? String(giaoVien).trim() : null;

  var kq = [];
  
  for (var i = 0; i < mang.length; i++) {
    var row = mang[i];
    var rMon = row[7] ? String(row[7]).trim() : '';
    if (rMon === '') continue; 

    var rNam = row[1] ? String(row[1]).trim() : '';
    if (fNam && rNam !== fNam) continue;
    
    var rThang = row[9] ? String(row[9]).trim() : '';
    if (fThang && rThang !== fThang) continue;

    var rTuan = row[2] ? parseInt(row[2], 10) : null;
    if (fTuan && rTuan !== fTuan) continue;

    var rGv = row[8] ? String(row[8]).trim() : '';
    if (fGv && rGv !== fGv) continue;

    var ngayVal = row[10];
    var ngayStr = (ngayVal instanceof Date) ? ngayVal.getDate() + '/' + (ngayVal.getMonth() + 1) + '/' + ngayVal.getFullYear() : (ngayVal ? String(ngayVal).trim() : '');

    kq.push({ 
        namHoc: rNam, tuan: rTuan, 
        thu: row[3] ? String(row[3]).trim() : '', 
        buoi: row[4] ? String(row[4]).trim() : '', 
        tiet: row[5], 
        maLop: row[6] ? String(row[6]).trim() : '', 
        monHoc: rMon, maGv: rGv, 
        thang: rThang, ngay: ngayStr 
    });
  }
  return kq;
}

function layBanGhiKhungChuongTrinh() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('KHUNG_CHUONG_TRINH');
  if(!trang) return {classes: [], data: []};
  
  var mang = trang.getDataRange().getValues();
  if(mang.length < 2) return {classes: [], data: []};
  
  var tieuDe = mang[0];
  var classes = [];
  for(var j = 2; j < tieuDe.length; j++) {
    if(tieuDe[j]) classes.push(tieuDe[j].toString().trim());
  }
  
  var data = [];
  for(var i = 1; i < mang.length; i++) {
    if(!mang[i][0]) continue;
    var monHoc = mang[i][0].toString().trim();
    var uuTien = mang[i][1] !== '' ? mang[i][1] : '';
    var soTiet = [];
    for(var j = 0; j < classes.length; j++) {
       soTiet.push(mang[i][j+2] !== '' ? mang[i][j+2] : '');
    }
    data.push({monHoc: monHoc, uuTien: uuTien, soTiet: soTiet});
  }
  return {classes: classes, data: data};
}

function luuBanGhiKhungChuongTrinh(payload) {
  var khoaHeThong = LockService.getScriptLock();
  try {
    khoaHeThong.waitLock(10000);
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var trang = ss.getSheetByName('KHUNG_CHUONG_TRINH');
    if(!trang) trang = ss.insertSheet('KHUNG_CHUONG_TRINH');
    
    trang.clearContents();
    var classes = payload.classes || [];
    var data = payload.data || [];
    
    var mangGhi = [];
    var tieuDe = ['Môn học', 'Ưu tiên'].concat(classes);
    mangGhi.push(tieuDe);
    
    for(var i = 0; i < data.length; i++) {
       var dong = [data[i].monHoc, data[i].uuTien];
       var soTiet = data[i].soTiet || [];
       for(var j = 0; j < classes.length; j++) {
          dong.push(soTiet[j] !== undefined ? soTiet[j] : '');
       }
       mangGhi.push(dong);
    }
    
    if(mangGhi.length > 0) {
       trang.getRange(1, 1, mangGhi.length, mangGhi[0].length).setValues(mangGhi);
    }
    SpreadsheetApp.flush();
    xoaCacheHeThongToanDien();
    return {trangThai: 'Thành công', thongBao: 'Đã lưu cấu trúc Khung Chương trình và xóa cache thành công.'};
  } catch(e) {
    if (e.message && e.message.includes('lock')) return {trangThai: 'Lỗi', thongBao: 'Hệ thống đang bận ghi dữ liệu, vui lòng thử lại sau giây lát.'};
    return {trangThai: 'Lỗi', thongBao: e.toString()};
  } finally {
    khoaHeThong.releaseLock();
  }
}

function layDuLieuDanhMucGV() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('DM_GIAOVIEN');
  if(!trang) return [];
  return trang.getDataRange().getValues();
}

function luuDuLieuDanhMucGV(duLieu) {
  var khoaHeThong = LockService.getScriptLock();
  try {
    // Kích hoạt khóa bảo vệ 10 giây để chống tình trạng Race Condition
    khoaHeThong.waitLock(10000); 
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var trang = ss.getSheetByName('DM_GIAOVIEN');
    
    if (!trang) trang = ss.insertSheet('DM_GIAOVIEN');
    
    trang.clearContents();
    if (duLieu && duLieu.length > 0) {
      trang.getRange(1, 1, duLieu.length, duLieu[0].length).setValues(duLieu);
    }
    SpreadsheetApp.flush();
    // [NÂNG CẤP TỔNG THỂ]: Hủy bộ nhớ đệm ngay lập tức để đồng bộ danh tính mới
    xoaCacheHeThongToanDien();
    
    return {trangThai: 'Thành công', thongBao: 'Đã lưu danh mục giáo viên và đồng bộ cấu hình an toàn.'};
  } catch(e) {
    if (e.message.includes('lock')) return {trangThai: 'Lỗi', thongBao: 'Hệ thống đang bận ghi dữ liệu, vui lòng thử lại sau giây lát.'};
    return {trangThai: 'Lỗi', thongBao: e.toString()};
  } finally {
    khoaHeThong.releaseLock();
  }
}

function layDuLieuCaiDat() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('CAI_DAT');
  if(!trang) return [];
  return trang.getDataRange().getDisplayValues(); 
}

function luuDuLieuCaiDat(duLieu) {
  try {
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var trang = ss.getSheetByName('CAI_DAT');
    if(!trang) trang = ss.insertSheet('CAI_DAT');
    trang.clearContents();
    if(duLieu && duLieu.length > 0) {
      trang.getRange(1, 1, duLieu.length, duLieu[0].length).setValues(duLieu);
    }
    
    // [NÂNG CẤP]: Phá vỡ bộ nhớ đệm (Cache) ngay lập tức sau khi lưu Cài đặt để đồng bộ tức thì
    if (typeof xoaCacheHeThongToanDien === 'function') {
        xoaCacheHeThongToanDien();
    }
    
    return {trangThai: 'Thành công', thongBao: 'Đã lưu hệ thống Cài đặt và đồng bộ cấu hình.'};
  } catch(e) {
    return {trangThai: 'Lỗi', thongBao: e.toString()};
  }
}

function layDuLieuDanhMucLop() {
  var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
  var trang = ss.getSheetByName('DM_LOP');
  if(!trang) return [];
  
  var lastRow = trang.getLastRow();
  if (lastRow < 1) return [];
  
  var maxCol = Math.min(Math.max(trang.getLastColumn(), 3), 4);
  return trang.getRange(1, 1, lastRow, maxCol).getValues();
}

function luuDuLieuDanhMucLop(duLieu) {
  var khoaHeThong = LockService.getScriptLock();
  try {
    khoaHeThong.waitLock(10000);
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var trang = ss.getSheetByName('DM_LOP');
    if(!trang) trang = ss.insertSheet('DM_LOP');
    trang.clearContents();
    if(duLieu && duLieu.length > 0) {
      trang.getRange(1, 1, duLieu.length, duLieu[0].length).setValues(duLieu);
    }
    SpreadsheetApp.flush();
    xoaCacheHeThongToanDien();
    return {trangThai: 'Thành công', thongBao: 'Đã lưu danh mục Lớp và đồng bộ cấu hình.'};
  } catch(e) {
    if (e.message && e.message.includes('lock')) return {trangThai: 'Lỗi', thongBao: 'Hệ thống đang bận ghi dữ liệu, vui lòng thử lại sau giây lát.'};
    return {trangThai: 'Lỗi', thongBao: e.toString()};
  } finally {
    khoaHeThong.releaseLock();
  }
}

// =========================================================================
// [BẢN NÂNG CẤP HIỆU NĂNG CAO]: LẤY DỮ LIỆU TKB VÀ BÁO GIẢNG (O(N))
// Hỗ trợ truy xuất toàn khối (Tất cả) và trả về đầy đủ Tên môn học
// =========================================================================
function layTkbVaPpct(tuanLocStr, lopLoc, khoiLoc, monLoc, tuanHienTaiStr, daCoPpctStr, daCoTkbStr) {
  try {
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var tuanHienTai = parseInt(tuanHienTaiStr, 10) || 1;
    var tuanYeuCau = parseInt(tuanLocStr, 10) || 1;
    var daCoPpct = (String(daCoPpctStr || '') === '1');
    var daCoTkb = (String(daCoTkbStr || '') === '1');
    var cache = CacheService.getScriptCache();

    var duLieuTkb = [];
    // [SÀNG LỌC CHÊNH LỆCH 1]: Chỉ đọc bảng TKB nếu phía trình duyệt chưa có sẵn TKB của tuần/lớp đó
    if (!daCoTkb) {
        var tenSheetTkb = 'TKB_HIEN_TAI';
        if (tuanYeuCau < tuanHienTai) tenSheetTkb = 'DATA_TKB';
        else if (tuanYeuCau > tuanHienTai) tenSheetTkb = 'TKB_CoDinh';

        if (tenSheetTkb === 'TKB_HIEN_TAI') {
            damBaoTkbHienTaiKhiTrong(ss);
        }

        var shTkb = ss.getSheetByName(tenSheetTkb);
        if (shTkb && shTkb.getLastRow() > 1) {
            var soCotTkb = Math.min(Math.max(shTkb.getLastColumn(), 11), 12);
            var dataTkb = shTkb.getRange(1, 1, shTkb.getLastRow(), soCotTkb).getDisplayValues();
            var lopMucTieu = String(lopLoc || '').trim();
            var namHocDung = (tenSheetTkb === 'DATA_TKB') ? layNamHocHienTai(ss) : '';
            
            for (var i = 1; i < dataTkb.length; i++) {
                if (dataTkb[i][0] === 'Mã Tiết' || dataTkb[i][0] === '') continue;

                // Kiểm tra Lớp trước (O(1)) để bỏ qua ngay các lớp khác
                if (String(dataTkb[i][6]).trim() === lopMucTieu) {
                    var rTuan = parseInt(String(dataTkb[i][2] || '').replace(/\D/g, ''), 10);
                    if (tenSheetTkb === 'TKB_CoDinh' || rTuan === tuanYeuCau || tenSheetTkb === 'TKB_HIEN_TAI') {
                        if (tenSheetTkb === 'DATA_TKB' && namHocDung !== '') {
                            var nhDong = String(dataTkb[i][1] || '').trim();
                            if (nhDong !== '' && nhDong !== namHocDung) continue;
                        }
                        var ngayStr = String(dataTkb[i][10] || '').trim();
                        duLieuTkb.push({
                            thu: String(dataTkb[i][3]).trim(),
                            buoi: String(dataTkb[i][4]).trim(),
                            tiet: parseInt(dataTkb[i][5], 10) || dataTkb[i][5],
                            monHoc: String(dataTkb[i][7]).trim(),
                            ngay: ngayStr,
                            tietPpc: dataTkb[i][11] ? String(dataTkb[i][11]).trim() : ''
                        });
                    }
                }
            }
        }
    }

    var duLieuPpct = [];
    // [SÀNG LỌC CHÊNH LỆCH 2]: Chỉ đọc bảng PPCT nếu phía trình duyệt chưa có PPCT của Khối đó
    if (!daCoPpct) {
        var khoiMucTieu = String(khoiLoc || '').trim();
        var monKiemTra = String(monLoc || '').trim();
        var verCachePpct = cache.get("VER_TKB_CACHE") || "1";
        var cacheKeyPpct = "CACHE_PPCT_KHOI_V2_" + verCachePpct + "_" + khoiMucTieu;
        var dsKhoiCached = null;

        try {
            var rawCachePpct = cache.get(cacheKeyPpct);
            if (rawCachePpct) dsKhoiCached = JSON.parse(rawCachePpct);
        } catch (eCP) {}

        if (!dsKhoiCached) {
            dsKhoiCached = [];
            var shPpct = ss.getSheetByName('PPCT');
            if (shPpct && shPpct.getLastRow() > 1) {
                var soCotPpct = Math.min(Math.max(shPpct.getLastColumn(), 4), 5);
                var dataPpct = shPpct.getRange(2, 1, shPpct.getLastRow() - 1, soCotPpct).getDisplayValues();
                var lastKhoi = '';
                var lastMon = '';
                
                for (var j = 0; j < dataPpct.length; j++) {
                    var kRaw = String(dataPpct[j][0] || '').trim();
                    if (kRaw !== '') lastKhoi = kRaw; else kRaw = lastKhoi;
                    var kMatch = kRaw.match(/\d+/);
                    var kSo = kMatch ? kMatch[0] : kRaw;

                    var mRaw = String(dataPpct[j][2] || '').trim();
                    if (mRaw !== '') lastMon = mRaw; else mRaw = lastMon;

                    if (kSo === khoiMucTieu || kRaw === khoiMucTieu) {
                        var tietVal = String(dataPpct[j][1] || '').trim();
                        if (tietVal !== '') {
                            dsKhoiCached.push({ 
                                tiet: tietVal, 
                                monHoc: mRaw,
                                tenBaiHoc: String(dataPpct[j][3] || '').trim(), 
                                dieuChinh: dataPpct[j][4] ? String(dataPpct[j][4]).trim() : '' 
                            });
                        }
                    }
                }
                if (dsKhoiCached.length > 0) {
                    try {
                        var strPpct = JSON.stringify(dsKhoiCached);
                        if (strPpct.length < 95000) cache.put(cacheKeyPpct, strPpct, 1800);
                    } catch (ePutPpct) {}
                }
            }
        }

        if (monKiemTra === '' || monKiemTra === 'ALL' || monKiemTra === 'Tất cả') {
            duLieuPpct = dsKhoiCached;
        } else {
            for (var k = 0; k < dsKhoiCached.length; k++) {
                if (dsKhoiCached[k].monHoc === monKiemTra) {
                    duLieuPpct.push(dsKhoiCached[k]);
                }
            }
        }
    }

    return { trangThai: 'Thành công', duLieuTkb: duLieuTkb, duLieuPpct: duLieuPpct };
  } catch (loi) { return { trangThai: 'Lỗi', thongBao: loi.toString() }; }
}

// =========================================================================
// [BẢN NÂNG CẤP HIỆU NĂNG CAO]: LƯU TRỮ PPCT AN TOÀN (BẢO VỆ TUYỆT ĐỐI CỘT L TRẠNG THÁI TKB)
// Chỉ ghi vào bảng PPCT, tuyệt đối không ghi đè mất cờ DAY_TIET / THE_TIET ở Cột L bảng TKB
// =========================================================================
function luuDuLieuPPCT(payload) {
  var khoaHeThong = LockService.getScriptLock();
  try {
     khoaHeThong.waitLock(15000);
     if (!payload || !Array.isArray(payload) || payload.length === 0) {
         return { trangThai: 'Thành công' };
     }

     var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
     var shPpct = ss.getSheetByName('PPCT');
     var tieuDeChuan = ['Khối lớp', 'Tiết PPCT', 'Tên môn học', 'Tên bài học', 'Điều chỉnh'];
     if (!shPpct) shPpct = ss.insertSheet('PPCT');

     var lastRowPpct = shPpct.getLastRow();
     var newDataPpct = [tieuDeChuan];
     var khoiMucTieu = String(payload[0].khoi || '').trim();

     // Chuẩn hóa chữ hoa/thường và khoảng trắng thừa để đối chiếu chính xác
     function chuanHoaTenMon(ten) {
         return String(ten || '').normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
     }

     // Gom toàn bộ các cặp (Khối, Môn) có trong dữ liệu gửi lên
     var tapCanXoa = {};
     for (var m = 0; m < payload.length; m++) {
         var kKey = String(payload[m].khoi || '').trim();
         var mKey = chuanHoaTenMon(payload[m].mon);
         if (kKey && mKey) {
             tapCanXoa[kKey + '||' + mKey] = true;
         }
     }

     if (lastRowPpct > 0) {
         var dataPpct = shPpct.getRange(1, 1, lastRowPpct, Math.max(shPpct.getLastColumn(), 5)).getValues();
         if (String(dataPpct[0][0]).trim() !== '') newDataPpct[0] = dataPpct[0].slice(0, 5); 

         for (var i = 1; i < dataPpct.length; i++) {
             var khoaDongCu = String(dataPpct[i][0]).trim() + '||' + chuanHoaTenMon(dataPpct[i][2]);
             if (!tapCanXoa[khoaDongCu]) {
                 newDataPpct.push([
                     dataPpct[i][0] || '', dataPpct[i][1] || '', dataPpct[i][2] || '',
                     dataPpct[i][3] || '', dataPpct[i][4] || ''
                 ]);
             }
         }
     }

     // Khử trùng lặp theo (Khối || Môn || Tiết PPCT), ưu tiên dòng có chỉnh sửa trực tiếp trên lưới (daSua === true)
     var mapTietMoi = {};
     var thuTuKhoaMoi = [];
     for (var k = 0; k < payload.length; k++) {
         var item = payload[k];
         var khoiStr = String(item.khoi || '').trim();
         var tietStr = String(item.tietPpc || '').trim();
         var monStr = String(item.mon || '').trim();
         if (!khoiStr || !tietStr || !monStr) continue;

         var khoaTiet = khoiStr + '||' + chuanHoaTenMon(monStr) + '||' + tietStr;
         var dongMoi = [
             khoiStr,
             tietStr,
             monStr,
             item.tenBai || '',
             item.dieuChinh || ''
         ];

         if (mapTietMoi[khoaTiet] === undefined) {
             mapTietMoi[khoaTiet] = { dong: dongMoi, daSua: !!item.daSua };
             thuTuKhoaMoi.push(khoaTiet);
         } else if (item.daSua || (!mapTietMoi[khoaTiet].dong[3] && dongMoi[3])) {
             mapTietMoi[khoaTiet] = { dong: dongMoi, daSua: !!item.daSua };
         }
     }

     for (var u = 0; u < thuTuKhoaMoi.length; u++) {
         newDataPpct.push(mapTietMoi[thuTuKhoaMoi[u]].dong);
     }

     shPpct.clearContents();
     shPpct.getRange(1, 1, newDataPpct.length, 5).setValues(newDataPpct);
     shPpct.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#f3f4f6");
     SpreadsheetApp.flush();

     // Xóa bộ nhớ đệm PPCT của Khối để đồng bộ tức thì sang cả Tab PPCT và Tab Sổ đầu bài
     try {
         var cache = CacheService.getScriptCache();
         var verCachePpct = cache.get("VER_TKB_CACHE") || "1";
         cache.remove("CACHE_PPCT_KHOI_V2_" + khoiMucTieu);
         cache.remove("CACHE_PPCT_KHOI_V2_" + verCachePpct + "_" + khoiMucTieu);
     } catch (eRm) {}
     if (typeof xoaCacheHeThongToanDien === 'function') xoaCacheHeThongToanDien();

     return { trangThai: 'Thành công' };
  } catch (loi) {
     return { trangThai: 'Lỗi', thongBao: loi.toString() };
  } finally {
     khoaHeThong.releaseLock();
  }
}

function luuDuLieuDanhMucSGK(duLieu) {
  try {
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var trang = ss.getSheetByName('DANH_MUC_SGK');
    if (!trang) trang = ss.insertSheet('DANH_MUC_SGK');
    
    trang.clearContents();
    
    if (duLieu && duLieu.length > 0) {
      trang.getRange(1, 1, duLieu.length, duLieu[0].length).setValues(duLieu);
      trang.getRange(1, 1, 1, duLieu[0].length).setFontWeight("bold").setBackground("#f3f4f6");
    }
    
    return {trangThai: 'Thành công', thongBao: 'Đã cập nhật hệ thống Danh mục Học liệu số.'};
  } catch(loi) {
    return {trangThai: 'Lỗi', thongBao: loi.toString()};
  }
}

function docDanhMucSGK() {
  try {
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var trang = ss.getSheetByName('DANH_MUC_SGK');
    if (!trang) return []; 
    
    var lastRow = trang.getLastRow();
    if (lastRow < 2) return [];
    
    return trang.getRange(2, 1, lastRow - 1, 4).getValues();
  } catch (loi) { return []; }
}

function layThongTinDanhMucToanBo() {
  try {
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    
    var trangSGK = ss.getSheetByName('DANH_MUC_SGK');
    var duLieuSGK = [];
    if (trangSGK) {
      var lastRowSGK = trangSGK.getLastRow();
      if (lastRowSGK >= 1) {
        duLieuSGK = trangSGK.getRange(1, 1, lastRowSGK, 4).getValues();
      }
    }
    
    var trangKhung = ss.getSheetByName('KHUNG_CHUONG_TRINH');
    var dsMonHoc = [];
    if (trangKhung) {
      var lastRowKhung = trangKhung.getLastRow();
      if (lastRowKhung >= 2) {
        var mangKhung = trangKhung.getRange(2, 1, lastRowKhung - 1, 1).getValues();
        for (var i = 0; i < mangKhung.length; i++) {
          var mon = String(mangKhung[i][0]).trim();
          if (mon !== '' && dsMonHoc.indexOf(mon) === -1) {
            dsMonHoc.push(mon);
          }
        }
      }
    }
    
    return { sgk: duLieuSGK, monHoc: dsMonHoc };
  } catch (loi) { 
    return { sgk: [], monHoc: [] }; 
  }
}

function ghiDeDanhMucSGK(mangDuLieuMoi) {
  try {
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var trang = ss.getSheetByName('DANH_MUC_SGK');
    if (!trang) return JSON.stringify({trangThai: 'loi', thongBao: 'Không tìm thấy trang DANH_MUC_SGK trong CSDL'});
    
    var lastRow = trang.getLastRow();
    
    if (lastRow > 1) {
      trang.getRange(2, 1, lastRow - 1, 4).clearContent();
    }
    
    if (mangDuLieuMoi && mangDuLieuMoi.length > 0) {
      trang.getRange(2, 1, mangDuLieuMoi.length, 4).setValues(mangDuLieuMoi);
    }
    
    return JSON.stringify({trangThai: 'thanh_cong'});
  } catch (loi) { 
    return JSON.stringify({trangThai: 'loi', thongBao: loi.toString()}); 
  }
}

// =========================================================================
// HÀM TIỆN ÍCH QUẢN LÝ NĂM HỌC VÀ KHÓA ĐỊNH DANH 6 TRỤC
// =========================================================================

// Lấy thông tin năm học hiện tại từ bảng CAI_DAT
function layNamHocHienTai(ss) {
    try {
        if (!ss) ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var shCD = ss.getSheetByName('CAI_DAT');
        if (shCD) {
            var dataCD = shCD.getDataRange().getValues();
            for (var i = 1; i < dataCD.length; i++) {
                if (String(dataCD[i][0]).trim().toUpperCase() === 'NAM_HOC') {
                    var val = String(dataCD[i][1]).trim();
                    if (val) return val;
                }
            }
        }
    } catch(e) {}
    return '';
}

// Suy luận năm học từ ngày (Chuẩn năm học Việt Nam: Tháng 8 trở đi là năm học X-(X+1), trước tháng 8 là (X-1)-X)
function xacDinhNamHocTuNgay(ngayVal) {
    if (!ngayVal) return '';
    if (ngayVal instanceof Date) {
        var strMMYYYY = Utilities.formatDate(ngayVal, "GMT+7", "MM/yyyy");
        var p = strMMYYYY.split('/');
        var thang = parseInt(p[0], 10);
        var nam = parseInt(p[1], 10);
        return (thang >= 8) ? (nam + '-' + (nam + 1)) : ((nam - 1) + '-' + nam);
    }
    var s = String(ngayVal).trim();
    var m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m) {
        var thang = parseInt(m[2], 10);
        var nam = parseInt(m[3], 10);
        return (thang >= 8) ? (nam + '-' + (nam + 1)) : ((nam - 1) + '-' + nam);
    }
    var m2 = s.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (m2) {
        var nam = parseInt(m2[1], 10);
        var thang = parseInt(m2[2], 10);
        return (thang >= 8) ? (nam + '-' + (nam + 1)) : ((nam - 1) + '-' + nam);
    }
    return '';
}

// Tách hoặc suy luận năm học từ Mã Lưu Trữ / Ngày
function tachNamHocTuMa(maLuuTru, ngayVal, namHocMacDinh) {
    if (maLuuTru) {
        var sMa = String(maLuuTru).trim();
        var m = sMa.match(/^(\d{4}-\d{4})_/);
        if (m) return m[1];
    }
    var nhTuNgay = xacDinhNamHocTuNgay(ngayVal);
    if (nhTuNgay) return nhTuNgay;
    return namHocMacDinh ? String(namHocMacDinh).trim() : '';
}

// =========================================================================
// HÀM MÁY CHỦ: GHI CHỐT SỔ ĐẦU BÀI (BẢN TỐI ƯU HIỆU NĂNG SIÊU TỐC)
// Nguyên tắc: Quét 6 trục gồm [Năm học, Tuần, Lớp, Thứ, Buổi, Tiết]
// -> Phân tách năm học tuyệt đối, chống trùng lặp dữ liệu giữa các năm học
// =========================================================================
function luuSoDauBaiDongBo(payload) {
    var khoaHeThong = LockService.getScriptLock();
    try {
        khoaHeThong.waitLock(15000); 
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var shSDB = ss.getSheetByName('SoDauBai');
        
        var tieuDe = ['Mã Lưu Trữ', 'Tuần', 'Mã Lớp', 'Thứ', 'Ngày', 'Buổi', 'Tiết', 'Môn Học', 'Tiết PPCT', 'Tên Bài Dạy', 'Nhận Xét', 'Xếp Loại', 'Chữ Ký GV', 'Chuyên Cần'];
        var soCotChuan = tieuDe.length;

        if (!shSDB) {
            shSDB = ss.insertSheet('SoDauBai');
            shSDB.getRange(1, 1, 1, soCotChuan).setValues([tieuDe]).setFontWeight("bold").setBackground("#e2e8f0");
        }

        var duLieuMoi = payload.duLieu;
        if (!duLieuMoi || duLieuMoi.length === 0) return { trangThai: 'thanh_cong' };

        var namHocPayload = payload.namHoc ? String(payload.namHoc).trim() : layNamHocHienTai(ss);

        // Chặn ghi đè nếu Tuần này của trường đã bị Khóa trong Năm học này
        var tuanSoPayload = parseInt(String(payload.tuan).replace(/\D/g, ''), 10);
        var banDoKhoa = layTrangThaiKhoaSoDauBai(namHocPayload);
        if (banDoKhoa[tuanSoPayload] && banDoKhoa[tuanSoPayload].daKhoa) {
            var emailNguoiLuu = payload.emailTruyCap || '';
            if (!kiemTraQuyenKhoaSo(emailNguoiLuu)) {
                return { 
                    trangThai: 'loi_he_thong', 
                    thongBao: 'Sổ đầu bài TUẦN ' + tuanSoPayload + (namHocPayload ? (' (Năm học ' + namHocPayload + ')') : '') + ' của toàn trường ĐÃ BỊ KHÓA bởi Quản lý. Mọi hành vi lưu đè đều bị từ chối!' 
                };
            }
        }

        function chuanHoaChuoiKhoa(str) {
            if (!str && str !== 0) return '';
            return String(str).trim().toLowerCase().normalize('NFC').replace(/\s+/g, '');
        }

        // Khóa định danh 6 trục: [Năm học]_[Tuần]_[Lớp]_[Thứ]_[Buổi]_[Tiết]
        function taoKhoaChuan(namHoc, tuan, lop, thu, buoi, tiet) {
            var nh = chuanHoaChuoiKhoa(namHoc);
            var t = parseInt(String(tuan).replace(/\D/g, ''), 10) || 0;
            var l = chuanHoaChuoiKhoa(lop);
            var th = chuanHoaChuoiKhoa(thu);
            var b = chuanHoaChuoiKhoa(buoi);
            var ti = chuanHoaChuoiKhoa(tiet);
            return (nh ? nh + "_" : "") + t + "_" + l + "_" + th + "_" + b + "_" + ti;
        }

        var lastRow = shSDB.getLastRow();
        var banDoDong = {}; 

        // 1. Quét tọa độ các dòng hiện có trên sheet SoDauBai
        if (lastRow > 0) {
            var mapData = shSDB.getRange(1, 1, lastRow, 7).getValues(); 
            for (var i = 1; i < mapData.length; i++) {
                var maCu = mapData[i][0];
                var tuanCu = mapData[i][1]; 
                var lopCu = mapData[i][2]; 
                var thuCu = mapData[i][3]; 
                var ngayCu = mapData[i][4];
                var buoiCu = mapData[i][5]; 
                var tietCu = mapData[i][6];

                // Xác định năm học của dòng hiện tại: ưu tiên từ cột A, sau đó từ ngày cột E, cuối cùng là năm học hiện tại
                var namHocDong = tachNamHocTuMa(maCu, ngayCu, namHocPayload);

                var thuCuUpper = String(thuCu || '').trim().toUpperCase();
                var laDongTongHopCu = (thuCuUpper === 'TONGHOP' || thuCuUpper === 'TỔNG HỢP' || String(maCu || '').trim().toUpperCase().indexOf('_TONGHOP') !== -1);

                if (String(tuanCu).trim() !== '' && String(lopCu).trim() !== '') {
                    if (laDongTongHopCu) {
                        var kTh1 = taoKhoaChuan(namHocDong, tuanCu, lopCu, 'TONGHOP', 'TONGHOP', 'TONGHOP');
                        var kTh2 = taoKhoaChuan(namHocDong, tuanCu, lopCu, 'TONGHOP', '', '');
                        var kTh3 = chuanHoaChuoiKhoa((namHocDong ? namHocDong + '_' : '') + (parseInt(String(tuanCu).replace(/\D/g, ''), 10) || 0) + '_' + String(lopCu).trim().toUpperCase() + '_TONGHOP');
                        banDoDong[kTh1] = i + 1;
                        banDoDong[kTh2] = i + 1;
                        banDoDong[kTh3] = i + 1;
                        if (!namHocDong || namHocDong === namHocPayload) {
                            banDoDong[taoKhoaChuan('', tuanCu, lopCu, 'TONGHOP', 'TONGHOP', 'TONGHOP')] = i + 1;
                            banDoDong[chuanHoaChuoiKhoa((parseInt(String(tuanCu).replace(/\D/g, ''), 10) || 0) + '_' + String(lopCu).trim().toUpperCase() + '_TONGHOP')] = i + 1;
                        }
                    } else {
                        var khoaAnhXa = taoKhoaChuan(namHocDong, tuanCu, lopCu, thuCu, buoiCu, tietCu);
                        if (khoaAnhXa !== '0____') {
                            banDoDong[khoaAnhXa] = i + 1; 
                        }
                    }
                }
                // Hỗ trợ thêm ánh xạ theo Mã Lưu Trữ (Cột A)
                if (maCu) {
                    var khoaMaCu = chuanHoaChuoiKhoa(maCu);
                    if (khoaMaCu) {
                        banDoDong[khoaMaCu] = i + 1;
                        if (namHocDong && khoaMaCu.indexOf(chuanHoaChuoiKhoa(namHocDong)) === -1) {
                            banDoDong[chuanHoaChuoiKhoa(namHocDong) + '_' + khoaMaCu] = i + 1;
                        }
                    }
                }
            }
        }

        var mangThemMoi = [];
        var mangGhiDe = [];

        for (var j = 0; j < duLieuMoi.length; j++) {
            var row = duLieuMoi[j];
            var nhRow = row.namHoc || namHocPayload;
            var thuRowUpper = String(row.thu || '').trim().toUpperCase();
            var laDongTongHopMoi = (thuRowUpper === 'TONGHOP' || thuRowUpper === 'TỔNG HỢP');

            if (laDongTongHopMoi) {
                row.thu = 'TONGHOP';
                row.buoi = 'TONGHOP';
                row.tiet = 'TONGHOP';
            }

            var khoaClient = taoKhoaChuan(nhRow, row.tuan, row.maLop, row.thu, row.buoi, row.tiet);
            var maLuuTruChuan = row.maLuuTru;

            if (laDongTongHopMoi) {
                var tNum = parseInt(String(row.tuan).replace(/\D/g, ''), 10) || 0;
                var lopUp = String(row.maLop || '').trim().toUpperCase();
                maLuuTruChuan = (nhRow ? nhRow + '_' : '') + tNum + '_' + lopUp + '_TONGHOP';
            } else if (nhRow && (!maLuuTruChuan || maLuuTruChuan.indexOf(nhRow + '_') !== 0)) {
                var chuCaiDauThu = String(row.thu || '').trim();
                var chuCaiDauBuoi = String(row.buoi || '').trim();
                maLuuTruChuan = nhRow + '_' + row.tuan + '_' + String(row.maLop || '').trim().toUpperCase() + '_' + chuCaiDauThu + '_' + chuCaiDauBuoi + '_' + row.tiet;
            }

            // Tìm dòng cần ghi: ưu tiên khóa 6 trục có năm học -> Mã lưu trữ chuẩn -> Khóa dự phòng cùng năm học
            var dongCanGhi = banDoDong[khoaClient];
            if (!dongCanGhi && maLuuTruChuan) {
                dongCanGhi = banDoDong[chuanHoaChuoiKhoa(maLuuTruChuan)];
            }
            if (!dongCanGhi && row.maLuuTru) {
                dongCanGhi = banDoDong[chuanHoaChuoiKhoa(row.maLuuTru)];
            }
            if (!dongCanGhi) {
                var khoaKhongNam = taoKhoaChuan('', row.tuan, row.maLop, row.thu, row.buoi, row.tiet);
                dongCanGhi = banDoDong[khoaKhongNam];
            }

            var rowData = [
                maLuuTruChuan, row.tuan, row.maLop, row.thu, row.ngay, 
                row.buoi, row.tiet, row.mon, row.tietPPCT, row.tenBai,
                row.nhanXet, row.xepLoai, row.chuKy, row.chuyenCan || ''
            ];

            if (dongCanGhi) {
                // NẾU TỒN TẠI: Đưa vào mảng ghi đè chính xác dòng đó
                mangGhiDe.push({
                    dong: dongCanGhi,
                    duLieu: [rowData]
                });
            } else {
                // NẾU LÀ TIẾT MỚI TINH (HOẶC TIẾT CỦA NĂM HỌC MỚI): Chèn thêm dòng mới
                mangThemMoi.push(rowData);
                banDoDong[khoaClient] = lastRow + mangThemMoi.length;
                if (maLuuTruChuan) banDoDong[chuanHoaChuoiKhoa(maLuuTruChuan)] = lastRow + mangThemMoi.length;
            }
        }

        // =====================================================================
        // THỰC THI GHI DỮ LIỆU NHẮM MỤC TIÊU (GIẢM 90% TẢI MÁY CHỦ)
        // =====================================================================
        
        // 1. Cập nhật ghi đè các dòng đã tồn tại
        for (var k = 0; k < mangGhiDe.length; k++) {
            shSDB.getRange(mangGhiDe[k].dong, 1, 1, soCotChuan).setValues(mangGhiDe[k].duLieu);
        }

        // 2. Chèn dòng mới
        if (mangThemMoi.length > 0) {
            lastRow = shSDB.getLastRow(); 
            shSDB.getRange(lastRow + 1, 1, mangThemMoi.length, soCotChuan).setValues(mangThemMoi);
            shSDB.getRange(lastRow + 1, 14, mangThemMoi.length, 1).setNumberFormat('@');
        }

        // 3. [VỆ TINH ĐIỂM DANH]: Đồng bộ chi tiết sĩ số & tên HS vắng vào sheet DIEM_DANH_SDB (bao gồm cả xóa trống khi chiTietChuyenCan = null)
        var dsCanDongBoDD = [];
        var coChiTietMoiDD = false;
        for (var ddIdx = 0; ddIdx < duLieuMoi.length; ddIdx++) {
            var rDD = duLieuMoi[ddIdx];
            var thuDDUpper = String(rDD.thu || '').trim().toUpperCase();
            if (thuDDUpper === 'TONGHOP' || thuDDUpper === 'TỔNG HỢP') continue;
            dsCanDongBoDD.push(rDD);
            if (rDD.chiTietChuyenCan && typeof rDD.chiTietChuyenCan === 'object') {
                coChiTietMoiDD = true;
            }
        }

        if (dsCanDongBoDD.length > 0) {
            var shDD = ss.getSheetByName('DIEM_DANH_SDB');
            var tieuDeDD = [
                'Mã Lưu Trữ', 'Năm Học', 'Tuần', 'Mã Lớp', 'Thứ', 'Ngày', 'Buổi', 'Tiết',
                'Tổng Sĩ Số', 'Có Mặt', 'Vắng Có Phép', 'Vắng Không Phép',
                'Tên HS Vắng Phép', 'Tên HS Vắng Không Phép', 'Người Cập Nhật'
            ];
            var soCotDD = tieuDeDD.length;
            if (!shDD && coChiTietMoiDD) {
                shDD = ss.insertSheet('DIEM_DANH_SDB');
                shDD.getRange(1, 1, 1, soCotDD).setValues([tieuDeDD]).setFontWeight("bold").setBackground("#e2e8f0");
            }

            if (shDD) {
                var lastRowDD = shDD.getLastRow();
                var banDoDD = {};
                if (lastRowDD > 1) {
                    var mapDD = shDD.getRange(1, 1, lastRowDD, 8).getValues();
                    for (var ddi = 1; ddi < mapDD.length; ddi++) {
                        var maCuDD = String(mapDD[ddi][0] || '').trim();
                        var nhCuDD = String(mapDD[ddi][1] || '').trim() || namHocPayload;
                        var tCuDD = mapDD[ddi][2];
                        var lCuDD = mapDD[ddi][3];
                        var thCuDD = mapDD[ddi][4];
                        var bCuDD = mapDD[ddi][6];
                        var tiCuDD = mapDD[ddi][7];
                        if (maCuDD) banDoDD[chuanHoaChuoiKhoa(maCuDD)] = ddi + 1;
                        var k6DD = taoKhoaChuan(nhCuDD, tCuDD, lCuDD, thCuDD, bCuDD, tiCuDD);
                        if (k6DD && k6DD !== '0____') banDoDD[k6DD] = ddi + 1;
                    }
                }

                var mangGhiDeDD = [];
                var mangThemMoiDD = [];
                var nguoiCapNhatDD = String(payload.emailTruyCap || '').trim();

                for (var dIdx = 0; dIdx < dsCanDongBoDD.length; dIdx++) {
                    var itemDD = dsCanDongBoDD[dIdx];
                    var ct = (itemDD.chiTietChuyenCan && typeof itemDD.chiTietChuyenCan === 'object') ? itemDD.chiTietChuyenCan : null;
                    var nhItem = itemDD.namHoc || namHocPayload;
                    var maItem = itemDD.maLuuTru;
                    if (nhItem && (!maItem || maItem.indexOf(nhItem + '_') !== 0)) {
                        maItem = nhItem + '_' + itemDD.tuan + '_' + String(itemDD.maLop || '').trim().toUpperCase() + '_' + String(itemDD.thu || '').trim() + '_' + String(itemDD.buoi || '').trim() + '_' + itemDD.tiet;
                    }
                    var k6Item = taoKhoaChuan(nhItem, itemDD.tuan, itemDD.maLop, itemDD.thu, itemDD.buoi, itemDD.tiet);
                    var dongDD = banDoDD[k6Item] || (maItem ? banDoDD[chuanHoaChuoiKhoa(maItem)] : null);

                    var tongSo = ct ? (parseInt(ct.tongSiSo, 10) || 0) : 0;
                    var dsP = (ct && Array.isArray(ct.dsVangCoPhep)) ? ct.dsVangCoPhep.map(function(s){ return String(s || '').trim(); }).filter(Boolean) : [];
                    var dsKP = (ct && Array.isArray(ct.dsVangKhongPhep)) ? ct.dsVangKhongPhep.map(function(s){ return String(s || '').trim(); }).filter(Boolean) : [];
                    var vangP = ct ? (dsP.length > 0 ? dsP.length : (parseInt(ct.vangCoPhep, 10) || 0)) : 0;
                    var vangKP = ct ? (dsKP.length > 0 ? dsKP.length : (parseInt(ct.vangKhongPhep, 10) || 0)) : 0;
                    var coMat = Math.max(0, tongSo - vangP - vangKP);
                    var coDuLieuDD = !!(ct && (tongSo > 0 || vangP > 0 || vangKP > 0 || dsP.length > 0 || dsKP.length > 0));

                    var rowValuesDD = coDuLieuDD ? [
                        maItem,
                        nhItem,
                        itemDD.tuan,
                        String(itemDD.maLop || '').trim().toUpperCase(),
                        itemDD.thu,
                        itemDD.ngay,
                        itemDD.buoi,
                        itemDD.tiet,
                        tongSo > 0 ? tongSo : '',
                        tongSo > 0 ? coMat : '',
                        tongSo > 0 ? vangP : '',
                        tongSo > 0 ? vangKP : '',
                        dsP.join(', '),
                        dsKP.join(', '),
                        nguoiCapNhatDD
                    ] : [
                        maItem,
                        nhItem,
                        itemDD.tuan,
                        String(itemDD.maLop || '').trim().toUpperCase(),
                        itemDD.thu,
                        itemDD.ngay,
                        itemDD.buoi,
                        itemDD.tiet,
                        '', '', '', '', '', '', ''
                    ];

                    if (dongDD) {
                        mangGhiDeDD.push({ dong: dongDD, duLieu: [rowValuesDD] });
                    } else if (coDuLieuDD) {
                        mangThemMoiDD.push(rowValuesDD);
                        banDoDD[k6Item] = lastRowDD + mangThemMoiDD.length;
                        if (maItem) banDoDD[chuanHoaChuoiKhoa(maItem)] = lastRowDD + mangThemMoiDD.length;
                    }
                }

                for (var kd = 0; kd < mangGhiDeDD.length; kd++) {
                    shDD.getRange(mangGhiDeDD[kd].dong, 1, 1, soCotDD).setValues(mangGhiDeDD[kd].duLieu);
                }
                if (mangThemMoiDD.length > 0) {
                    lastRowDD = shDD.getLastRow();
                    shDD.getRange(lastRowDD + 1, 1, mangThemMoiDD.length, soCotDD).setValues(mangThemMoiDD);
                    shDD.getRange(lastRowDD + 1, 6, mangThemMoiDD.length, 1).setNumberFormat('@');
                }
            }
        }

        SpreadsheetApp.flush();
        if (typeof xoaCacheHeThongToanDien === 'function') xoaCacheHeThongToanDien();
        return { trangThai: 'thanh_cong' };

    } catch (loi) {
        if (loi.message.indexOf('lock') !== -1 || loi.message.indexOf('Timeout') !== -1) {
            return { trangThai: 'loi_he_thong', thongBao: 'Hệ thống đang bận. Xin đồng chí vui lòng bấm Lưu lại sau giây lát!' };
        }
        return { trangThai: 'loi_he_thong', thongBao: 'Lỗi ghi Sổ đầu bài: ' + loi.toString() };
    } finally {
        khoaHeThong.releaseLock();
    }
}


function trichXuatQuyenPhanCong(emailTruyenVao) {
    // [VƯỢT RÀO GOOGLE]: Ưu tiên nhận định danh gửi từ Giao diện thay vì Session
    var emailTruyCap = emailTruyenVao ? String(emailTruyenVao).trim().toLowerCase() : String(Session.getActiveUser().getEmail()).trim().toLowerCase(); 
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    
    var maDinhDanh = "";
    var laBanGiamHieu = false;
    var shDMGV = ss.getSheetByName('DM_GIAOVIEN');
    var danhSachTatCaGiaoVien = []; // [NÂNG CẤP]: Khởi tạo mảng chứa danh sách giáo viên
        
    if (shDMGV) { 
        var dataGV = shDMGV.getDataRange().getValues();
        for (var i = 1; i < dataGV.length; i++) {
            // [NÂNG CẤP]: Thu thập tên giáo viên từ cột B (Index 1), bỏ qua ô trống
            var tenGvCotB = dataGV[i][1] ? String(dataGV[i][1]).trim() : '';
            if (tenGvCotB !== "") danhSachTatCaGiaoVien.push(tenGvCotB);

            // Logic cũ: Tìm mã định danh theo email
            // Bỏ lệnh break để vòng lặp tiếp tục chạy đến hết danh sách
            if (emailTruyCap !== "" && dataGV[i].length > 5 && String(dataGV[i][5]).trim().toLowerCase() === emailTruyCap) {
                maDinhDanh = String(dataGV[i][0]).trim();
            }
        }
    }
     

    var tuDienPhanCong = {};
    if (maDinhDanh !== "") {
        var shPhanCong = ss.getSheetByName('PHAN_CONG');
        if (shPhanCong && shPhanCong.getLastRow() > 1) {
            var dataPhanCong = shPhanCong.getDataRange().getValues();
            var dongTieuDe = dataPhanCong[0]; 
            
            for (var r = 1; r < dataPhanCong.length; r++) {
                var maLop = String(dataPhanCong[r][0]).trim().toUpperCase();
                tuDienPhanCong[maLop] = [];
                for (var c = 1; c < dataPhanCong[r].length; c++) {
                    if (String(dataPhanCong[r][c]).trim().toLowerCase() === maDinhDanh.toLowerCase()) {
                        var tenMon = String(dongTieuDe[c]).trim().toLowerCase().replace(/\s+/g, ' ');
                        if (tenMon !== "") tuDienPhanCong[maLop].push(tenMon);
                    }
                }
            }
        }
    }

    var duLieuCauHinh = docBangCauHinh();
    if (duLieuCauHinh && duLieuCauHinh.DANH_SACH_QUAN_TRI) {
        for (var q = 0; q < duLieuCauHinh.DANH_SACH_QUAN_TRI.length; q++) {
            if (String(duLieuCauHinh.DANH_SACH_QUAN_TRI[q]).trim().toLowerCase() === emailTruyCap) {
                laBanGiamHieu = true;
                break;
            }
        }
    }

    return { QUYEN_THEO_LOP: tuDienPhanCong, TOAN_QUYEN: laBanGiamHieu, MA_GIAO_VIEN: maDinhDanh };
}

// =========================================================================
// [NÂNG CẤP SIÊU TỐC]: LẤY DỮ LIỆU SỔ ĐẦU BÀI TOÀN BỘ
// - Đọc NAM_HOC 1 lần duy nhất, loại bỏ toàn bộ dữ liệu không liên quan (Danh mục sách, cột thừa)
// - Lưu đệm (CacheService) cho dữ liệu danh mục tĩnh (PPCT, KHUNG_CHUONG_TRINH, DM_LOP, DM_GIAOVIEN)
// - Ánh xạ chính xác GVCN từ DM_LOP -> Họ tên đầy đủ Cột B DM_GIAOVIEN và quyền khóa sổ BGH
// =========================================================================
function layDuLieuSoDauBai_ToanBo(emailTruyenVao, taiToanBoTruyenVao) {
    try {
        var emailTruyCap = emailTruyenVao ? String(emailTruyenVao).trim().toLowerCase() : String(Session.getActiveUser().getEmail()).trim().toLowerCase();
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();

        var maDinhDanh = "";
        var tenDinhDanh = ""; 
        var laBanGiamHieu = false;
        var quyenKhoaSdb = false;
        var tuDienPhanCong = {};
        var namHocHienTai = "";

        // 1. Đọc CAI_DAT đúng 1 lần duy nhất để lấy cả NAM_HOC và danh sách Admin/BGH
        var shCaiDat = ss.getSheetByName('CAI_DAT');
        if (shCaiDat && shCaiDat.getLastRow() > 1) {
            var dataCD = shCaiDat.getRange(1, 1, shCaiDat.getLastRow(), 5).getDisplayValues();
            for (var q = 1; q < dataCD.length; q++) {
                var kCD = String(dataCD[q][0] || '').trim().toUpperCase();
                if (kCD === 'NAM_HOC' && dataCD[q][1]) {
                    namHocHienTai = String(dataCD[q][1]).trim();
                }
                var adminCell = String(dataCD[q][4] || '').trim().toLowerCase();
                if (adminCell !== '' && adminCell === emailTruyCap) {
                    laBanGiamHieu = true;
                    quyenKhoaSdb = true;
                }
            }
        }
        if (!namHocHienTai) namHocHienTai = layNamHocHienTai(ss);

        function nanNgayNhanh(giaTri) {
            if (!giaTri || giaTri === '') return '';
            if (giaTri instanceof Date) {
                return giaTri.getDate().toString().padStart(2, '0') + '/' + (giaTri.getMonth() + 1).toString().padStart(2, '0') + '/' + giaTri.getFullYear();
            }
            var str = String(giaTri).trim();
            if (str.match(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/)) {
                var p = str.split(/[-/]/);
                return p[2].padStart(2, '0') + '/' + p[1].padStart(2, '0') + '/' + p[0];
            }
            if (str.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) return str.replace(/-/g, '/');
            return str;
        }

        // Hàm đọc và nén CSDL tối ưu (Giới hạn đúng số cột cần thiết, bỏ qua các cột không liên quan)
        function docNhanhVaNenCSDL(tenSheet, isPPCT) {
            var sheet = ss.getSheetByName(tenSheet);
            if (!sheet) return [];
            var lastRow = sheet.getLastRow();
            var lastCol = sheet.getLastColumn();
            if (lastRow < 1 || lastCol < 1) return [];

            // Giới hạn số cột đọc để tăng tốc tối đa và không quét các cột nháp/không liên quan
            var maxColRead = lastCol;
            if (tenSheet === 'PPCT') maxColRead = Math.min(lastCol, 5); // Đọc 5 cột A, B, C, D, E (Khối, Tiết, Môn, Tên bài, Điều chỉnh) để dùng chung với tab PPCT
            else if (tenSheet === 'TKB_HIEN_TAI' || tenSheet === 'DATA_TKB') maxColRead = Math.min(lastCol, 12); // Cột A -> L (bao gồm cột L: Tiết PPCT)
            else if (tenSheet === 'SoDauBai') maxColRead = Math.min(lastCol, 14); // Cột A -> N

            var mang2D = sheet.getRange(1, 1, lastRow, maxColRead).getValues();
            var ds = [];
            var soCot = mang2D[0].length;
            var lastKhoi = '';
            var startRow = (tenSheet === 'KHUNG_CHUONG_TRINH') ? 0 : 1;

            for (var r = startRow; r < mang2D.length; r++) {
                var row = mang2D[r];
                if (r > 0 && row[0] === '' && row[1] === '' && row[2] === '') continue;
                if (r > 0 && (row[0] === 'Mã Tiết' || row[0] === 'Khối lớp' || row[0] === 'Mã Lưu Trữ')) continue;

                // [CÁCH LY ĐA NĂM HỌC CHO SĐB]: Chỉ nạp dữ liệu thuộc năm học hiện tại
                if (tenSheet === 'DATA_TKB' && namHocHienTai) {
                    var nhDongTkb = String(row[1] || '').trim();
                    if (!nhDongTkb && row[10]) {
                        nhDongTkb = xacDinhNamHocTuNgay(row[10]);
                    }
                    if (nhDongTkb && nhDongTkb !== namHocHienTai) continue;
                } else if (tenSheet === 'SoDauBai' && namHocHienTai) {
                    var maLuuTruSdb = String(row[0] || '').trim();
                    if (maLuuTruSdb.indexOf(namHocHienTai + '_') === 0) {
                        // Đúng năm học hiện tại
                    } else if (/^\d{4}-\d{4}_/.test(maLuuTruSdb)) {
                        continue;
                    } else if (row[4]) {
                        var nhNgaySdb = xacDinhNamHocTuNgay(row[4]);
                        if (nhNgaySdb && nhNgaySdb !== namHocHienTai) continue;
                    }
                }
                
                var obj = {};
                var hasData = false;
                
                for (var j = 0; j < soCot; j++) {
                    var colKey = String.fromCharCode(65 + j); 
                    // Loại bỏ các cột không dùng trong Sổ Đầu Bài để giảm 35% dung lượng JSON truyền tải
                    if ((tenSheet === 'DATA_TKB' || tenSheet === 'TKB_HIEN_TAI') && (colKey === 'A' || colKey === 'B' || colKey === 'J')) continue;
                    if (tenSheet === 'KHUNG_CHUONG_TRINH' && colKey === 'B') continue; // Bỏ qua cột B (Bộ sách / Ưu tiên)
                    
                    var cellData = row[j];
                    var val = '';
                    
                    if ((tenSheet === 'DATA_TKB' || tenSheet === 'TKB_HIEN_TAI') && colKey === 'K') {
                        val = nanNgayNhanh(cellData);
                    } else if (tenSheet === 'SoDauBai' && colKey === 'E') {
                        val = nanNgayNhanh(cellData);
                    } else {
                        if (cellData instanceof Date) {
                            val = nanNgayNhanh(cellData);
                        } else {
                            val = String(cellData !== null && cellData !== undefined ? cellData : '').trim();
                        }
                    }

                    if (isPPCT && r > 0 && colKey === 'A') { 
                        if (val !== '') lastKhoi = val; else val = lastKhoi;
                        obj[colKey] = val;
                        hasData = true;
                    } else if (val !== '') { 
                        obj[colKey] = val;
                        hasData = true;
                    }
                }
                if (hasData) ds.push(obj);
            }
            return ds;
        }

        // 2. Lấy dữ liệu Danh mục tĩnh (DM_GIAOVIEN, DM_LOP, PPCT, KHUNG_CHUONG_TRINH) qua bộ nhớ đệm CacheService
        var canTaiDuLieuTinh = (String(taiToanBoTruyenVao) === 'true' || taiToanBoTruyenVao === undefined);
        var cache = CacheService.getScriptCache();
        var sdbStaticKey = "CACHE_SDB_STATIC_V2";
        var staticData = null;

        var cachedStaticCount = cache.get(sdbStaticKey + "_count");
        if (cachedStaticCount) {
            try {
                var numStaticChunks = parseInt(cachedStaticCount, 10);
                var sKeys = [];
                for (var sIdx = 0; sIdx < numStaticChunks; sIdx++) sKeys.push(sdbStaticKey + "_" + sIdx);
                var sChunks = cache.getAll(sKeys);
                var combinedStatic = "";
                for (var sIdx2 = 0; sIdx2 < numStaticChunks; sIdx2++) {
                    if (sChunks[sdbStaticKey + "_" + sIdx2]) combinedStatic += sChunks[sdbStaticKey + "_" + sIdx2];
                }
                if (combinedStatic) staticData = JSON.parse(combinedStatic);
            } catch (eCache) {
                staticData = null;
            }
        }

        if (!staticData) {
            var dsTatCaGV = [];
            var tuDienHoTenGV = {};
            var mapEmailToGV = {};

            var shDMGV = ss.getSheetByName('DM_GIAOVIEN');
            if (shDMGV && shDMGV.getLastRow() > 1) {
                var maxColGV = Math.min(shDMGV.getLastColumn(), 6);
                var dataGV = shDMGV.getRange(2, 1, shDMGV.getLastRow() - 1, maxColGV).getDisplayValues();
                for (var i = 0; i < dataGV.length; i++) {
                    var maGvCotA = String(dataGV[i][0] || '').trim();
                    var tenGvCotB = String(dataGV[i][1] || '').trim();
                    var emailCotF = (dataGV[i].length > 5 && dataGV[i][5]) ? String(dataGV[i][5]).trim().toLowerCase() : '';

                    if (tenGvCotB !== "") dsTatCaGV.push(tenGvCotB);
                    if (maGvCotA !== "") {
                        var hoTenChuan = tenGvCotB !== "" ? tenGvCotB : maGvCotA;
                        tuDienHoTenGV[maGvCotA.toLowerCase().normalize('NFC')] = hoTenChuan;
                    }
                    if (emailCotF !== "") {
                        mapEmailToGV[emailCotF] = {
                            maGV: maGvCotA,
                            tenGV: tenGvCotB !== "" ? tenGvCotB : maGvCotA
                        };
                    }
                }
            }

            var gvcnTheoLop = {};
            var siSoTheoLop = {};
            var shLop = ss.getSheetByName('DM_LOP');
            if (shLop && shLop.getLastRow() > 1) {
                var maxColLop = Math.min(Math.max(shLop.getLastColumn(), 3), 4);
                var dataLop = shLop.getRange(2, 1, shLop.getLastRow() - 1, maxColLop).getDisplayValues();
                for (var lIdx = 0; lIdx < dataLop.length; lIdx++) {
                    var mLop = String(dataLop[lIdx][0] || '').trim().toUpperCase();
                    var gvcn = (dataLop[lIdx].length > 2) ? String(dataLop[lIdx][2] || '').trim() : '';
                    if (mLop) {
                        gvcnTheoLop[mLop] = gvcn;
                        if (dataLop[lIdx].length > 3) {
                            var rawSiSoLop = String(dataLop[lIdx][3] || '').replace(/\D/g, '');
                            if (rawSiSoLop) siSoTheoLop[mLop] = parseInt(rawSiSoLop, 10) || 0;
                        }
                    }
                }
            }

            staticData = {
                DANH_SACH_GIAO_VIEN: dsTatCaGV,
                TU_DIEN_HO_TEN_GV: tuDienHoTenGV,
                MAP_EMAIL_GV: mapEmailToGV,
                GVCN_THEO_LOP: gvcnTheoLop,
                SI_SO_THEO_LOP: siSoTheoLop,
                PPCT: docNhanhVaNenCSDL('PPCT', true),
                KHUNG_CHUONG_TRINH: docNhanhVaNenCSDL('KHUNG_CHUONG_TRINH', false)
            };

            try {
                var strStatic = JSON.stringify(staticData);
                var cSize = 90000;
                var tChunks = Math.ceil(strStatic.length / cSize);
                cache.put(sdbStaticKey + "_count", tChunks.toString(), 1800);
                for (var cIdx = 0; cIdx < tChunks; cIdx++) {
                    cache.put(sdbStaticKey + "_" + cIdx, strStatic.substring(cIdx * cSize, (cIdx + 1) * cSize), 1800);
                }
            } catch (eSaveCache) {}
        }

        // Xác định danh tính giáo viên đang đăng nhập từ staticData
        if (emailTruyCap !== "") {
            if (staticData.MAP_EMAIL_GV && staticData.MAP_EMAIL_GV[emailTruyCap]) {
                maDinhDanh = staticData.MAP_EMAIL_GV[emailTruyCap].maGV;
                tenDinhDanh = staticData.MAP_EMAIL_GV[emailTruyCap].tenGV;
            } else if (staticData.TU_DIEN_HO_TEN_GV && staticData.TU_DIEN_HO_TEN_GV[emailTruyCap.normalize('NFC')]) {
                maDinhDanh = emailTruyCap;
                tenDinhDanh = staticData.TU_DIEN_HO_TEN_GV[emailTruyCap.normalize('NFC')];
            }
        }

        // Kiểm tra quyền Khóa Sổ đầu bài (BGH) trong PHAN_QUYEN_ADMIN nếu chưa phải Admin trong CAI_DAT
        if (!quyenKhoaSdb && emailTruyCap !== "") {
            var maDinhDanhLC_PQ = maDinhDanh ? maDinhDanh.toLowerCase() : '';
            var shPQ = ss.getSheetByName('PHAN_QUYEN_ADMIN');
            if (shPQ && shPQ.getLastRow() > 1) {
                var dataPQ = shPQ.getRange(2, 1, shPQ.getLastRow() - 1, 3).getDisplayValues();
                for (var pIdx = 0; pIdx < dataPQ.length; pIdx++) {
                    var tkPQ = String(dataPQ[pIdx][0] || '').trim().toLowerCase();
                    if (tkPQ !== '' && (tkPQ === emailTruyCap || (maDinhDanhLC_PQ !== '' && tkPQ === maDinhDanhLC_PQ))) {
                        var dsNutPQ = String(dataPQ[pIdx][2] || '').split(',').map(function(s) { return s.trim(); });
                        if (dsNutPQ.indexOf('btnKhoaSoDauBai') !== -1) {
                            quyenKhoaSdb = true;
                            break;
                        }
                    }
                }
            }
        }

        // 3. Đọc TKB_HIEN_TAI và DATA_TKB (Chỉ gọi damBaoTkbHienTaiKhiTrong khi TKB_HIEN_TAI thực sự trống)
        var mangTkbHienTai = docNhanhVaNenCSDL('TKB_HIEN_TAI', false);
        if (mangTkbHienTai.length === 0) {
            if (damBaoTkbHienTaiKhiTrong(ss)) {
                mangTkbHienTai = docNhanhVaNenCSDL('TKB_HIEN_TAI', false);
            }
        }
        var mangTkbQuaKhu = docNhanhVaNenCSDL('DATA_TKB', false);

        if (maDinhDanh !== "") {
            var maDinhDanhLC = maDinhDanh.toLowerCase();
            
            var tuanHeThong = 1;
            if (mangTkbHienTai.length > 0 && mangTkbHienTai[0]['C']) {
                tuanHeThong = parseInt(String(mangTkbHienTai[0]['C']).replace(/\D/g, '')) || 1;
            }

            mangTkbHienTai.forEach(function(dong) {
                var tuanDong = parseInt(String(dong['C']).replace(/\D/g, '')) || 0;
                if (tuanDong >= tuanHeThong) {
                    var maLop = String(dong['G']).trim().toUpperCase(); 
                    var gv = String(dong['I']).trim().toLowerCase();    
                    var mon = String(dong['H']).trim().toLowerCase().replace(/\s+/g, ' '); 
                    
                    if (mon !== "" && gv.indexOf(maDinhDanhLC) !== -1) {
                        if (!tuDienPhanCong[maLop]) tuDienPhanCong[maLop] = [];
                        if (tuDienPhanCong[maLop].indexOf(mon) === -1) tuDienPhanCong[maLop].push(mon);
                    }
                }
            });

            mangTkbQuaKhu.forEach(function(dong) {
                var tuanDong = parseInt(String(dong['C']).replace(/\D/g, '')) || 0;
                if (tuanDong < tuanHeThong) {
                    var maLop = String(dong['G']).trim().toUpperCase();
                    var gv = String(dong['I']).trim().toLowerCase();
                    var mon = String(dong['H']).trim().toLowerCase().replace(/\s+/g, ' ');
                    
                    if (mon !== "" && gv.indexOf(maDinhDanhLC) !== -1) {
                        if (!tuDienPhanCong[maLop]) tuDienPhanCong[maLop] = [];
                        if (tuDienPhanCong[maLop].indexOf(mon) === -1) tuDienPhanCong[maLop].push(mon);
                    }
                }
            });
        }

        // Đọc bản đồ chi tiết sĩ số & tên học sinh vắng từ sheet vệ tinh DIEM_DANH_SDB
        var mapDiemDanhSDB = {};
        var shDDRead = ss.getSheetByName('DIEM_DANH_SDB');
        if (shDDRead && shDDRead.getLastRow() > 1) {
            var maxColDDRead = Math.min(shDDRead.getLastColumn(), 15);
            var dataDDRead = shDDRead.getRange(2, 1, shDDRead.getLastRow() - 1, maxColDDRead).getValues();
            for (var dr = 0; dr < dataDDRead.length; dr++) {
                var rDDItem = dataDDRead[dr];
                var nhDD = String(rDDItem[1] || '').trim();
                if (namHocHienTai && nhDD && nhDD !== namHocHienTai) continue;
                var tuanDD = String(rDDItem[2] || '').replace(/\D/g, '');
                var lopDD = String(rDDItem[3] || '').trim().toUpperCase();
                var thuRawDD = String(rDDItem[4] || '').trim().toLowerCase();
                var thuDD = thuRawDD ? (thuRawDD.charAt(0).toUpperCase() + thuRawDD.slice(1)) : '';
                var buoiDD = String(rDDItem[6] || '').trim().toLowerCase() === 'sáng' ? 'sáng' : 'chiều';
                var tietDD = String(rDDItem[7] || '').trim();
                if (!tuanDD || !lopDD || !thuDD || !tietDD) continue;

                var tongDD = parseInt(rDDItem[8], 10) || 0;
                var coMatDD = parseInt(rDDItem[9], 10) || 0;
                var vangPDD = parseInt(rDDItem[10], 10) || 0;
                var vangKPDD = parseInt(rDDItem[11], 10) || 0;
                var strPDD = String(rDDItem[12] || '').trim();
                var strKPDD = String(rDDItem[13] || '').trim();
                if (tongDD === 0 && vangPDD === 0 && vangKPDD === 0 && !strPDD && !strKPDD) continue;

                var dsPDD = strPDD ? strPDD.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : [];
                var dsKPDD = strKPDD ? strKPDD.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : [];
                var khoaSlotDD = tuanDD + '_' + lopDD + '_' + thuDD + '_' + buoiDD + '_' + tietDD;
                mapDiemDanhSDB[khoaSlotDD] = {
                    tongSiSo: tongDD,
                    coMat: coMatDD,
                    vangCoPhep: vangPDD,
                    vangKhongPhep: vangKPDD,
                    dsVangCoPhep: dsPDD,
                    dsVangKhongPhep: dsKPDD
                };
            }
        }

        return {
            trangThai: 'thanh_cong',
            TKB_HIEN_TAI: mangTkbHienTai,
            DATA_TKB: mangTkbQuaKhu,
            PPCT: canTaiDuLieuTinh ? staticData.PPCT : [],
            KHUNG_CHUONG_TRINH: canTaiDuLieuTinh ? staticData.KHUNG_CHUONG_TRINH : [],
            GVCN_THEO_LOP: staticData.GVCN_THEO_LOP || {},
            SI_SO_THEO_LOP: staticData.SI_SO_THEO_LOP || {},
            DIEM_DANH_SDB: mapDiemDanhSDB,
            TU_DIEN_HO_TEN_GV: staticData.TU_DIEN_HO_TEN_GV || {},
            SO_DAU_BAI: docNhanhVaNenCSDL('SoDauBai', false),
            QUYEN_THEO_LOP: tuDienPhanCong,
            TOAN_QUYEN: laBanGiamHieu,
            QUYEN_KHOA_SDB: quyenKhoaSdb,
            MA_GIAO_VIEN: maDinhDanh,
            TEN_GIAO_VIEN: tenDinhDanh,
            DANH_SACH_GIAO_VIEN: staticData.DANH_SACH_GIAO_VIEN || [],
            NAM_HOC: namHocHienTai,
            TRANG_THAI_KHOA: layTrangThaiKhoaSoDauBai(namHocHienTai)
        };

    } catch (loi) {
        return { trangThai: 'loi_he_thong', thongBao: 'Lỗi API: ' + loi.toString() };
    }
}

// =========================================================================
// KHỐI HÀM XỬ LÝ ĐỌC/GHI CSDL PHÂN QUYỀN TRỰC TIẾP
// =========================================================================
function layDuLieuPhanQuyenHethong() {
    try {
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var trang = ss.getSheetByName('PHAN_QUYEN_ADMIN');
        if(!trang) return [];
        var lastRow = trang.getLastRow();
        if (lastRow < 2) return [];
        return trang.getRange(2, 1, lastRow - 1, 4).getDisplayValues();
    } catch (loi) { return []; }
}

function luuDuLieuPhanQuyenHethong(duLieu) {
    var khoaHeThong = LockService.getScriptLock();
    try {
        khoaHeThong.waitLock(10000);
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var trang = ss.getSheetByName('PHAN_QUYEN_ADMIN');
        
        if(!trang) {
            trang = ss.insertSheet('PHAN_QUYEN_ADMIN');
            trang.getRange(1, 1, 1, 4).setValues([['Tài khoản (Định danh)', 'Lớp được sửa', 'Nút được bấm', 'Menu được xem']]).setFontWeight("bold").setBackground("#e2e8f0");
        }
        
        var lastRow = trang.getLastRow();
        if(lastRow > 1) {
            trang.getRange(2, 1, lastRow - 1, 4).clearContent();
        }
        
        if(duLieu && duLieu.length > 0) {
            trang.getRange(2, 1, duLieu.length, 4).setValues(duLieu);
        }
        
        SpreadsheetApp.flush();
        
        // [NÂNG CẤP TỔNG THỂ]: Làm sạch toàn diện, không bỏ sót phân mảnh
        xoaCacheHeThongToanDien();
        
        return {trangThai: 'Thành công', thongBao: 'Đã cập nhật Ma trận phân quyền và đồng bộ hệ thống.'};
    } catch(loi) {
        if (loi.message.includes('lock')) return {trangThai: 'Lỗi', thongBao: 'Hệ thống đang bận xử lý, vui lòng lưu lại sau.'};
        return {trangThai: 'Lỗi', thongBao: loi.toString()};
    } finally {
        khoaHeThong.releaseLock();
    }
}

// =========================================================================
// HÀM MÁY CHỦ: BẬT / TẮT CÔNG KHAI MENU HOẶC NÚT (1 CLICK)
// =========================================================================
function chuyenDoiCongKhai1Click(payload) {
    var khoaHeThong = LockService.getScriptLock();
    try {
        khoaHeThong.waitLock(10000);
        
        var email = payload.emailTruyCap || '';
        if (!kiemTraQuyenKhoaSo(email)) {
            return { trangThai: 'loi_phan_quyen', thongBao: 'Từ chối: Chỉ tài khoản Quản trị (Admin) mới có quyền bật/tắt công khai!' };
        }

        var loai = payload.loai; // 'menu' hoặc 'nut' hoặc 'lop'
        var idCanDoi = String(payload.id || '').trim();
        var trangThaiBat = payload.congKhai === true; // true = Bật công khai, false = Tắt

        if (!idCanDoi) {
            return { trangThai: 'loi_he_thong', thongBao: 'Thiếu định danh menu/nút cần chuyển đổi.' };
        }

        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var trang = ss.getSheetByName('PHAN_QUYEN_ADMIN');
        if (!trang) {
            trang = ss.insertSheet('PHAN_QUYEN_ADMIN');
            trang.getRange(1, 1, 1, 4).setValues([['Tài khoản (Định danh)', 'Lớp được sửa', 'Nút được bấm', 'Menu được xem']]).setFontWeight("bold").setBackground("#e2e8f0");
        }

        var lastRow = trang.getLastRow();
        var dongCongKhai = -1;
        var lopArr = [], nutArr = [], menuArr = [];

        if (lastRow > 1) {
            var dataPQ = trang.getRange(2, 1, lastRow - 1, 4).getDisplayValues();
            for (var i = 0; i < dataPQ.length; i++) {
                var dDanh = String(dataPQ[i][0]).trim().toLowerCase();
                if (dDanh === '*' || dDanh.indexOf('công khai') !== -1 || dDanh.indexOf('congkhai') !== -1) {
                    dongCongKhai = i + 2;
                    lopArr = dataPQ[i][1] ? String(dataPQ[i][1]).split(',').map(function(s){return s.trim()}).filter(String) : [];
                    nutArr = dataPQ[i][2] ? String(dataPQ[i][2]).split(',').map(function(s){return s.trim()}).filter(String) : [];
                    menuArr = dataPQ[i][3] ? String(dataPQ[i][3]).split(',').map(function(s){return s.trim()}).filter(String) : [];
                    break;
                }
            }
        }

        // Cập nhật danh sách tương ứng
        if (loai === 'menu') {
            var idx = menuArr.indexOf(idCanDoi);
            if (trangThaiBat && idx === -1) menuArr.push(idCanDoi);
            if (!trangThaiBat && idx !== -1) menuArr.splice(idx, 1);
        } else if (loai === 'nut') {
            var idx = nutArr.indexOf(idCanDoi);
            if (trangThaiBat && idx === -1) nutArr.push(idCanDoi);
            if (!trangThaiBat && idx !== -1) nutArr.splice(idx, 1);
        } else if (loai === 'lop') {
            var idx = lopArr.indexOf(idCanDoi);
            if (trangThaiBat && idx === -1) lopArr.push(idCanDoi);
            if (!trangThaiBat && idx !== -1) lopArr.splice(idx, 1);
        }

        var tenDinhDanhCongKhai = '* (Công khai)';
        var rowValues = [[tenDinhDanhCongKhai, lopArr.join(', '), nutArr.join(', '), menuArr.join(', ')]];

        if (dongCongKhai !== -1) {
            trang.getRange(dongCongKhai, 1, 1, 4).setValues(rowValues);
        } else {
            trang.appendRow(rowValues[0]);
        }

        SpreadsheetApp.flush();
        xoaCacheHeThongToanDien();

        return {
            trangThai: 'Thành công',
            thongBao: (trangThaiBat ? 'Đã BẬT hiển thị công khai' : 'Đã TẮT hiển thị công khai') + ' thành công!',
            quyenCongKhai: {
                menu: menuArr,
                nut: nutArr,
                lop: lopArr
            }
        };

    } catch (e) {
        return { trangThai: 'loi_he_thong', thongBao: 'Lỗi thực thi: ' + e.toString() };
    } finally {
        khoaHeThong.releaseLock();
    }
}

function xoaCacheHeThongToanDien() {
    var cache = CacheService.getScriptCache();
    var dsCachePrefix = ["CACHE_CAU_HINH_HT_V2", "CACHE_SDB_STATIC_V2"];
    for (var p = 0; p < dsCachePrefix.length; p++) {
        var cacheKey = dsCachePrefix[p];
        var cachedChunks = cache.get(cacheKey + "_count");
        if (cachedChunks) {
            var keysToDelete = [cacheKey + "_count"];
            for (var i = 0; i < parseInt(cachedChunks, 10); i++) {
                keysToDelete.push(cacheKey + "_" + i);
            }
            try { cache.removeAll(keysToDelete); } catch (eDel) {}
        }
        try { cache.remove(cacheKey); } catch (eSingle) {}
    }
    try {
        cache.put("VER_TKB_CACHE", String(new Date().getTime()), 21600);
        cache.remove("CACHE_CAU_HINH_HT");
    } catch(e) {}
}

// =========================================================================
// HÀM BỔ SUNG: THUẬT TOÁN TÍNH TỔNG TIẾN ĐỘ TÍCH LŨY (LOẠI BỎ TƯƠNG LAI)
// =========================================================================
function layTienDoTichLuy(tuanHienTai, namHocLoc) {
    var tuanMucTieu = parseInt(tuanHienTai, 10);
    // Nếu đang xem Tuần 1, lịch sử bằng 0 nên trả về rỗng ngay lập tức
    if (isNaN(tuanMucTieu) || tuanMucTieu <= 1) return {};
    
    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    var trangData = ss.getSheetByName('DATA_TKB');
    var kq = {}; 
    var namHocDung = namHocLoc ? String(namHocLoc).trim() : layNamHocHienTai(ss);
    
    if (trangData) {
        var data = trangData.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
            if (data[i][0] === 'Mã Tiết' || data[i][0] === '') continue;
            var tuan = parseInt(data[i][2], 10);
            var nhDong = String(data[i][1] || '').trim();
            // [CÁCH LY ĐA NĂM HỌC]: Chỉ tính tích lũy cho đúng năm học hiện tại
            if (namHocDung && nhDong && nhDong !== namHocDung) continue;
            
            // [LÕI THUẬT TOÁN]: Chỉ đếm cộng dồn các Tuần < Tuần đang xem trên UI
            if (!isNaN(tuan) && tuan < tuanMucTieu) {
                var lop = String(data[i][6]).trim();
                var mon = String(data[i][7]).trim();
                if (lop && mon) {
                    if (!kq[lop]) kq[lop] = {};
                    kq[lop][mon] = (kq[lop][mon] || 0) + 1;
                }
            }
        }
    }
    return kq;
}

// =========================================================================
// HÀM PHỤ TRỢ: ĐẢM BẢO GÁN ĐẦY ĐỦ CỘT THÁNG & NGÀY (J:K) KHI LƯU / CHUYỂN TUẦN
// =========================================================================
function boSungNgayThangDayDuChoTKB(dsTiet, ss, tuanMucTieu) {
    if (!dsTiet || !Array.isArray(dsTiet) || dsTiet.length === 0) return;

    var mapThuIndex = { "thứ 2": 0, "thứ 3": 1, "thứ 4": 2, "thứ 5": 3, "thứ 6": 4, "thứ 7": 5, "chủ nhật": 6 };
    function chuanThu(str) {
        if (!str) return "thứ 2";
        var s = String(str).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
        if (s.match(/^[2-7]$/)) return "thứ " + s;
        if (s === "cn" || s === "chu nhat") return "chủ nhật";
        return s;
    }
    function tachChuoiNgay(val) {
        if (!val) return null;
        if (val instanceof Date) return isNaN(val.getTime()) ? null : new Date(val.getFullYear(), val.getMonth(), val.getDate());
        var s = String(val).trim();
        if (!s || s === '--' || s === '--/--/----') return null;
        var m1 = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
        if (m1) return new Date(parseInt(m1[3], 10), parseInt(m1[2], 10) - 1, parseInt(m1[1], 10));
        var m2 = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
        if (m2) return new Date(parseInt(m2[1], 10), parseInt(m2[2], 10) - 1, parseInt(m2[3], 10));
        return null;
    }

    var mapTheoThu = {};
    var ngayThu2Goc = null;

    // 1. Tìm ngày chuẩn từ những dòng đã có sẵn ngày trong dsTiet
    for (var i = 0; i < dsTiet.length; i++) {
        var item = dsTiet[i];
        var thuK = chuanThu(item.thu);
        var dObj = tachChuoiNgay(item.ngay);
        if (dObj && !isNaN(dObj.getTime())) {
            var dd = dObj.getDate().toString().padStart(2, '0');
            var mm = (dObj.getMonth() + 1).toString().padStart(2, '0');
            var yyyy = dObj.getFullYear();
            mapTheoThu[thuK] = { thang: mm, ngay: dd + '/' + mm + '/' + yyyy };
            if (!ngayThu2Goc) {
                var offset = (mapThuIndex[thuK] !== undefined) ? mapThuIndex[thuK] : 0;
                ngayThu2Goc = new Date(dObj.getFullYear(), dObj.getMonth(), dObj.getDate() - offset);
            }
        }
    }

    // 2. Nếu chưa suy ra được ngày Thứ 2, tra cứu mốc Thứ 2 đầu tuần từ sheet CAI_DAT
    if (!ngayThu2Goc && ss) {
        try {
            var infoThu2CD = layNgayThu2DauTuanTuCaiDat(ss);
            if (infoThu2CD && infoThu2CD.dateObj) {
                var dTuan1 = infoThu2CD.dateObj;
                var tSo = parseInt(tuanMucTieu, 10) || parseInt(dsTiet[0].tuan, 10) || 1;
                ngayThu2Goc = new Date(dTuan1.getFullYear(), dTuan1.getMonth(), dTuan1.getDate() + (tSo - 1) * 7);
            }
        } catch (e) {}
    }

    // 3. Nếu đã có ngày Thứ 2 gốc của tuần, sinh đầy đủ bộ Tháng & Ngày cho tất cả các Thứ
    if (ngayThu2Goc && !isNaN(ngayThu2Goc.getTime())) {
        for (var tenThu in mapThuIndex) {
            if (!mapTheoThu[tenThu]) {
                var dTinh = new Date(ngayThu2Goc.getFullYear(), ngayThu2Goc.getMonth(), ngayThu2Goc.getDate() + mapThuIndex[tenThu]);
                var dd2 = dTinh.getDate().toString().padStart(2, '0');
                var mm2 = (dTinh.getMonth() + 1).toString().padStart(2, '0');
                var yyyy2 = dTinh.getFullYear();
                mapTheoThu[tenThu] = { thang: mm2, ngay: dd2 + '/' + mm2 + '/' + yyyy2 };
            }
        }
    }

    // 4. Điền đầy đủ Tháng (Cột J) và Ngày (Cột K) cho mọi tiết còn thiếu
    for (var j = 0; j < dsTiet.length; j++) {
        var t = dsTiet[j];
        var tk = chuanThu(t.thu);
        var info = mapTheoThu[tk];
        if (info) {
            if (!t.ngay || String(t.ngay).trim() === '' || String(t.ngay).trim() === '--/--/----') {
                t.ngay = info.ngay;
            }
            if (!t.thang || String(t.thang).trim() === '' || String(t.thang).trim() === '--') {
                t.thang = info.thang;
            }
        }
    }
}

// =========================================================================
// HÀM MỚI: NHẬN MẢNG SỬA ĐỔI TKB (ĐỊNH TUYẾN 6 TRỤC CHUẨN)
// =========================================================================
function luuSuaTkbHienTai(dsThayDoi, dsToanLuoi, tuanGuiLen, laTuanHienTai) {
    var khoaHeThong = LockService.getScriptLock();
    try {
        khoaHeThong.waitLock(15000);
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();

        var tieuDeChuan = ['Mã Tiết', 'Năm học', 'Tuần', 'Thứ', 'Buổi', 'Tiết', 'Mã Lớp', 'Môn Học', 'Mã GV', 'Tháng', 'Ngày', 'Trạng thái'];
        var soCotChuan = tieuDeChuan.length;
        var namHocHienTai = layNamHocHienTai(ss);

        // 1. Kiểm tra dữ liệu từ dòng 2 của sheet TKB_HIEN_TAI và xác định Tuần Hệ thống
        var trangHT = ss.getSheetByName('TKB_HIEN_TAI');
        if (!trangHT) {
            trangHT = ss.insertSheet('TKB_HIEN_TAI');
            trangHT.getRange(1, 1, 1, soCotChuan).setValues([tieuDeChuan]).setFontWeight("bold").setBackground("#e2e8f0");
        }

        var lastRowHT = trangHT.getLastRow();
        var shHienTaiCoDuLieu = false;
        var tuanHeThong = 0;

        if (lastRowHT >= 2) {
            var dataHT = trangHT.getRange(2, 1, lastRowHT - 1, soCotChuan).getValues();
            for (var r = 0; r < dataHT.length; r++) {
                var cMa = String(dataHT[r][0] || '').trim();
                var cLop = String(dataHT[r][6] || '').trim();
                var cMon = String(dataHT[r][7] || '').trim();
                if ((cMa !== '' && cMa !== 'Mã Tiết') || cLop !== '' || cMon !== '') {
                    shHienTaiCoDuLieu = true;
                }
                var tSo = parseInt(String(dataHT[r][2] || '').replace(/\D/g, ''), 10);
                if (!isNaN(tSo) && tSo > tuanHeThong) tuanHeThong = tSo;
            }
        }

        if (tuanHeThong <= 0) {
            var shCD = ss.getSheetByName('CAI_DAT');
            if (shCD && shCD.getLastRow() > 1) {
                var dataCD = shCD.getRange(2, 1, shCD.getLastRow() - 1, 2).getValues();
                for (var c = 0; c < dataCD.length; c++) {
                    if (String(dataCD[c][0] || '').trim().toUpperCase() === 'TUAN_HIEN_TAI') {
                        var tCD = parseInt(String(dataCD[c][1] || '').replace(/\D/g, ''), 10);
                        if (!isNaN(tCD) && tCD > 0) tuanHeThong = tCD;
                        break;
                    }
                }
            }
            if (tuanHeThong <= 0) tuanHeThong = 1;
        }

        // 2. Xác định Tuần đang sửa
        var tuanSua = parseInt(tuanGuiLen, 10) || ((dsThayDoi && dsThayDoi.length > 0) ? parseInt(dsThayDoi[0].tuan, 10) : ((dsToanLuoi && dsToanLuoi.length > 0) ? parseInt(dsToanLuoi[0].tuan, 10) : tuanHeThong)) || 1;

        // 3. ĐỊNH TUYẾN THÔNG MINH
        var tenSheetGhi = 'TKB_HIEN_TAI';
        if (laTuanHienTai === true || (!shHienTaiCoDuLieu && tuanSua === tuanHeThong)) {
            tenSheetGhi = 'TKB_HIEN_TAI';
        } else if (tuanSua < tuanHeThong) {
            tenSheetGhi = 'DATA_TKB';
        } else if (tuanSua > tuanHeThong) {
            tenSheetGhi = 'TKB_CoDinh';
        }

        // 4. NẾU SH TKB_HIEN_TAI RỖNG CHƯA CÓ DỮ LIỆU TỪ DÒNG 2 -> GHI TOÀN BỘ GIÁ TRỊ TỪ LƯỚI VÀO SH
        if (tenSheetGhi === 'TKB_HIEN_TAI' && !shHienTaiCoDuLieu) {
            var nguonGhiToanBo = (dsToanLuoi && dsToanLuoi.length > 0) ? dsToanLuoi : (dsThayDoi || []);
            if (nguonGhiToanBo.length === 0) return { trangThai: 'khong_thay_doi' };

            boSungNgayThangDayDuChoTKB(nguonGhiToanBo, ss, tuanSua);

            var mangGhiMoi = [tieuDeChuan];
            for (var k = 0; k < nguonGhiToanBo.length; k++) {
                var tk = nguonGhiToanBo[k];
                if (tk.monHoc && String(tk.monHoc).trim() !== '') {
                    var nhTk = String(tk.namHoc || namHocHienTai).trim();
                    mangGhiMoi.push([tk.maTiet, nhTk, tk.tuan, tk.thu, tk.buoi, tk.tiet, tk.maLop, tk.monHoc, tk.maGv, tk.thang || '', tk.ngay || '', tk.trangThai || tk.ghiChu || '']);
                }
            }

            trangHT.getRange(1, 1, mangGhiMoi.length, soCotChuan).setValues(mangGhiMoi);
            if (lastRowHT > mangGhiMoi.length) {
                trangHT.getRange(mangGhiMoi.length + 1, 1, lastRowHT - mangGhiMoi.length, soCotChuan).clearContent();
            }

            SpreadsheetApp.flush();
            if (typeof xoaCacheHeThongToanDien === 'function') xoaCacheHeThongToanDien();
            return { trangThai: 'thanh_cong', daGhiToanBo: true };
        }

        // 5. NẾU ĐÃ CÓ DỮ LIỆU -> ÁNH XẠ CHÍNH XÁC ĐỂ GHI ĐÈ CHO TIẾT ĐÓ
        if (!dsThayDoi || dsThayDoi.length === 0) return { trangThai: 'khong_thay_doi' };

        boSungNgayThangDayDuChoTKB(dsThayDoi, ss, tuanSua);

        function chuanHoaChuoiTKB(str) {
            if (str === null || str === undefined) return '';
            return String(str).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
        }
        function chuanHoaThuTKB(str) {
            var s = chuanHoaChuoiTKB(str);
            if (s.match(/^[2-7]$/)) return 'thứ ' + s;
            if (s === 'cn' || s === 'chu nhat') return 'chủ nhật';
            return s;
        }
        function chuanHoaBuoiTKB(str) {
            var s = chuanHoaChuoiTKB(str);
            if (s === 's' || s === 'sang') return 'sáng';
            if (s === 'c' || s === 'chieu') return 'chiều';
            return s;
        }

        var trang = ss.getSheetByName(tenSheetGhi);
        if (!trang) {
            trang = ss.insertSheet(tenSheetGhi);
            trang.getRange(1, 1, 1, soCotChuan).setValues([tieuDeChuan]).setFontWeight("bold").setBackground("#e2e8f0");
        }

        var lastRow = trang.getLastRow();
        var dataCu = [];
        var mapToaDoTKB = {};

        if (lastRow > 0) {
            dataCu = trang.getRange(1, 1, lastRow, soCotChuan).getValues();
            for (var i = 1; i < dataCu.length; i++) {
                var maCu = chuanHoaChuoiTKB(dataCu[i][0]);
                var namHocCu = String(dataCu[i][1] || '').trim();
                var tuanCu = String(dataCu[i][2] || '').replace(/\D/g, '').trim();
                var thuCu = chuanHoaThuTKB(dataCu[i][3]);
                var buoiCu = chuanHoaBuoiTKB(dataCu[i][4]);
                var tietCu = String(dataCu[i][5] || '').replace(/\D/g, '').trim() || chuanHoaChuoiTKB(dataCu[i][5]);
                var lopCu = chuanHoaChuoiTKB(dataCu[i][6]).toUpperCase();
                
                // Chuẩn hóa Ngày để map tuyệt đối
                var ngayVal = dataCu[i][10];
                var ngayCu = '';
                if (ngayVal instanceof Date) {
                    ngayCu = ngayVal.getDate().toString().padStart(2, '0') + '/' + (ngayVal.getMonth() + 1).toString().padStart(2, '0') + '/' + ngayVal.getFullYear();
                } else {
                    ngayCu = String(ngayVal || '').trim();
                }

                // [ĐA NĂM HỌC]: Xác định năm học của dòng cũ trong CSDL
                var nhDongCu = namHocCu || tachNamHocTuMa(dataCu[i][0], ngayCu, namHocHienTai);
                var nhNorm = chuanHoaChuoiTKB(nhDongCu).replace(/\s+/g, '');

                if (maCu !== '' && maCu !== 'mã tiết') {
                    mapToaDoTKB['MA_' + maCu] = i;
                }
                
                if (lopCu !== '' && thuCu !== '' && buoiCu !== '' && tietCu !== '') {
                    if (tuanCu !== '') {
                        // [ĐA NĂM HỌC - TỌA ĐỘ 7 TRỤC]: Có cả Năm học + Ngày (chính xác tuyệt đối giữa các năm)
                        var toaDo7Truc = nhNorm + "_" + tuanCu + "_" + lopCu + "_" + thuCu + "_" + buoiCu + "_" + tietCu + "_" + ngayCu;
                        mapToaDoTKB[toaDo7Truc] = i;

                        // [ĐA NĂM HỌC - TỌA ĐỘ 6 TRỤC]: Có Năm học (dự phòng khi không có ngày hoặc lệch ngày)
                        var toaDo6Truc = nhNorm + "_" + tuanCu + "_" + lopCu + "_" + thuCu + "_" + buoiCu + "_" + tietCu;
                        if (mapToaDoTKB[toaDo6Truc] === undefined) mapToaDoTKB[toaDo6Truc] = i;

                        // Tọa độ tương thích dữ liệu cũ chưa có năm học
                        var toaDoCu6Truc = tuanCu + "_" + lopCu + "_" + thuCu + "_" + buoiCu + "_" + tietCu + "_" + ngayCu;
                        if (mapToaDoTKB[toaDoCu6Truc] === undefined) mapToaDoTKB[toaDoCu6Truc] = i;

                        var toaDoCu5Truc = tuanCu + "_" + lopCu + "_" + thuCu + "_" + buoiCu + "_" + tietCu;
                        if (mapToaDoTKB[toaDoCu5Truc] === undefined) mapToaDoTKB[toaDoCu5Truc] = i;
                    }
                    if (tenSheetGhi === 'TKB_HIEN_TAI' || tenSheetGhi === 'TKB_CoDinh') {
                        var toaDo4Truc = lopCu + "_" + thuCu + "_" + buoiCu + "_" + tietCu;
                        if (mapToaDoTKB[toaDo4Truc] === undefined) mapToaDoTKB[toaDo4Truc] = i;
                    }
                }
            }
        } else {
            dataCu = [tieuDeChuan];
        }

        var mangThemMoi = [];
        var coDoiDataCu = false;

        for (var j = 0; j < dsThayDoi.length; j++) {
            var t = dsThayDoi[j];
            var nhMoi = String(t.namHoc || namHocHienTai).trim();
            var nhMoiNorm = chuanHoaChuoiTKB(nhMoi).replace(/\s+/g, '');
            var ngayMoi = String(t.ngay || '').trim();
            var tuanMoiNorm = String(t.tuan || '').replace(/\D/g, '').trim();
            var lopMoiNorm = chuanHoaChuoiTKB(t.maLop).toUpperCase();
            var thuMoiNorm = chuanHoaThuTKB(t.thu);
            var buoiMoiNorm = chuanHoaBuoiTKB(t.buoi);
            var tietMoiNorm = String(t.tiet || '').replace(/\D/g, '').trim() || chuanHoaChuoiTKB(t.tiet);
            var maTietNorm = chuanHoaChuoiTKB(t.maTiet);
            
            // Khóa tra cứu ưu tiên từ độ chính xác cao nhất (có Năm học)
            var k7 = nhMoiNorm + "_" + tuanMoiNorm + "_" + lopMoiNorm + "_" + thuMoiNorm + "_" + buoiMoiNorm + "_" + tietMoiNorm + "_" + ngayMoi;
            var k6 = nhMoiNorm + "_" + tuanMoiNorm + "_" + lopMoiNorm + "_" + thuMoiNorm + "_" + buoiMoiNorm + "_" + tietMoiNorm;
            var kCu6 = tuanMoiNorm + "_" + lopMoiNorm + "_" + thuMoiNorm + "_" + buoiMoiNorm + "_" + tietMoiNorm + "_" + ngayMoi;
            var kCu5 = tuanMoiNorm + "_" + lopMoiNorm + "_" + thuMoiNorm + "_" + buoiMoiNorm + "_" + tietMoiNorm;
            var k4 = lopMoiNorm + "_" + thuMoiNorm + "_" + buoiMoiNorm + "_" + tietMoiNorm;
            
            var viTri = undefined;
            if (mapToaDoTKB[k7] !== undefined) viTri = mapToaDoTKB[k7];
            else if (mapToaDoTKB[k6] !== undefined) viTri = mapToaDoTKB[k6];
            else if (mapToaDoTKB[kCu6] !== undefined) viTri = mapToaDoTKB[kCu6];
            else if (mapToaDoTKB[kCu5] !== undefined) viTri = mapToaDoTKB[kCu5];
            else if (maTietNorm !== '' && mapToaDoTKB['MA_' + maTietNorm] !== undefined) viTri = mapToaDoTKB['MA_' + maTietNorm];
            else if ((tenSheetGhi === 'TKB_HIEN_TAI' || tenSheetGhi === 'TKB_CoDinh') && mapToaDoTKB[k4] !== undefined) viTri = mapToaDoTKB[k4];

            var maTietGhi = t.maTiet;
            var monMoi = String(t.monHoc || '').trim();
            var gvMoi = String(t.maGv || '').trim();
            // [YÊU CẦU LÕI]: Khi ấn lưu map mà tiết nào rỗng cả môn và giáo viên (hoặc môn rỗng/--/---) thì xóa cả dòng đó luôn
            var laRongCaMonVaGV = (monMoi === '' || monMoi === '--' || monMoi === '---') && 
                                 (gvMoi === '' || gvMoi === '--' || gvMoi === '---');
            var laTietXoa = (t.xoa === true || t.daXoa === true) || laRongCaMonVaGV || (monMoi === '' || monMoi === '--' || monMoi === '---');

            if (viTri !== undefined) {
                if (laTietXoa) {
                    // Đánh dấu xóa hẳn dòng này khỏi bảng tính CSDL
                    dataCu[viTri] = null;
                    coDoiDataCu = true;
                } else {
                    maTietGhi = String(dataCu[viTri][0]).trim();
                    // Chuẩn hóa mã tiết: nếu mã cũ là CD_ hoặc thiếu năm học hoặc rỗng thì dùng mã chuẩn mới từ t.maTiet
                    if (maTietGhi === '' || maTietGhi.indexOf('CD_') === 0 || !maTietGhi.match(/^\d{4}-\d{4}_/)) {
                        maTietGhi = t.maTiet;
                    }

                    var trangThaiGhi = (t.trangThai !== undefined && t.trangThai !== null) ? String(t.trangThai).trim() : ((t.ghiChu !== undefined && t.ghiChu !== null) ? String(t.ghiChu).trim() : ((viTri !== undefined && dataCu[viTri].length > 11) ? String(dataCu[viTri][11] || '').trim() : ''));
                    var mangDong = [maTietGhi, nhMoi, t.tuan, t.thu, t.buoi, t.tiet, t.maLop, t.monHoc, t.maGv, t.thang || '', t.ngay || '', trangThaiGhi];
                    dataCu[viTri] = mangDong; 
                    coDoiDataCu = true;
                }
            } else if (!laTietXoa && monMoi !== '') {
                var trangThaiMoi = (t.trangThai !== undefined && t.trangThai !== null) ? String(t.trangThai).trim() : ((t.ghiChu !== undefined && t.ghiChu !== null) ? String(t.ghiChu).trim() : '');
                var mangDongMoi = [maTietGhi, nhMoi, t.tuan, t.thu, t.buoi, t.tiet, t.maLop, t.monHoc, t.maGv, t.thang || '', t.ngay || '', trangThaiMoi];
                mangThemMoi.push(mangDongMoi); 
            }
        }

        // Lọc bỏ toàn bộ các dòng null đã xóa và xóa luôn các dòng rác cũ (rỗng cả môn và GV)
        var dataMoi = [];
        var soDongBiXoa = 0;
        for (var d = 0; d < dataCu.length; d++) {
            if (dataCu[d] === null) {
                soDongBiXoa++;
            } else if (d > 0 && (!dataCu[d][7] || String(dataCu[d][7]).trim() === '' || dataCu[d][7] === '--' || dataCu[d][7] === '---') && 
                                (!dataCu[d][8] || String(dataCu[d][8]).trim() === '' || dataCu[d][8] === '--' || dataCu[d][8] === '---')) {
                // Tiết nào rỗng cả môn và giáo viên thì xóa cả dòng đó luôn
                soDongBiXoa++;
            } else {
                dataMoi.push(dataCu[d]);
            }
        }
        if (soDongBiXoa > 0) coDoiDataCu = true;

        if (coDoiDataCu && dataMoi.length > 0) {
            trang.getRange(1, 1, dataMoi.length, soCotChuan).setValues(dataMoi);
            // Xóa sạch vùng dữ liệu dôi ra ở cuối bảng sau khi xóa dòng
            if (dataCu.length > dataMoi.length) {
                var soDongDu = dataCu.length - dataMoi.length;
                var soCotDu = Math.max(soCotChuan, trang.getLastColumn() || soCotChuan);
                trang.getRange(dataMoi.length + 1, 1, soDongDu, soCotDu).clearContent();
            }
        }
        if (mangThemMoi.length > 0) {
            var dongBatDauThem = (coDoiDataCu ? dataMoi.length : dataCu.length) + 1;
            trang.getRange(dongBatDauThem, 1, mangThemMoi.length, soCotChuan).setValues(mangThemMoi);
        }

        SpreadsheetApp.flush();
        if (typeof xoaCacheHeThongToanDien === 'function') xoaCacheHeThongToanDien();

        return { trangThai: 'thanh_cong' };
    } catch (loi) {
        return { trangThai: 'loi_he_thong', thongBao: loi.toString() };
    } finally {
        khoaHeThong.releaseLock();
    }
}
// =========================================================================
// KHỐI AI (BACKEND): XỬ LÝ LỖI TỪ GITHUB GỬI LÊN QUA API
// =========================================================================
function thucThiGeminiSuaLoi(duLieuNhan) {
    var thongBaoLoi = duLieuNhan.thongBaoLoi || "Không rõ";
    var viTriLoi = duLieuNhan.viTri || "Không rõ";
    var doanMaLienQuan = duLieuNhan.doanMaLienQuan || "Truy xuất giao diện";

    // Thay chuỗi bên dưới bằng API Key thật của đồng chí lấy từ Google AI Studio
    var apiKey = "ĐIỀN_API_KEY_GEMINI_CỦA_ĐỒNG_CHÍ_VÀO_ĐÂY"; 
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
    
    var promptHuanLuyen = `
        Bạn là một Kỹ sư phần mềm xuất sắc chuyên về kiến trúc Google Apps Script (Backend) và SPA GitHub Pages (Frontend).
        Hệ thống của tôi vừa phát sinh một sự kiện không thành công trên giao diện. Nhiệm vụ của bạn là phân tích và khắc phục.
        
        [THÔNG TIN SỰ CỐ]
        - Vị trí/Hàm nghi ngờ: ${viTriLoi}
        - Chi tiết lỗi (Log): ${thongBaoLoi}
        - Mã nguồn bối cảnh: ${doanMaLienQuan}

        [NGUYÊN TẮC THỰC THI BẮT BUỘC]
        1. PHÂN TÍCH LỖI: Trình bày ngắn gọn (1-2 câu) nguyên nhân gốc rễ (Do logic, do bất đồng bộ, hay do mất kết nối API...).
        2. CHỈ RÕ VỊ TRÍ THAY THẾ: Bắt buộc phải chỉ đích danh đoạn mã cũ cần bị xóa bỏ.
        3. MÃ NGUỒN MỚI: Cung cấp đoạn mã đã sửa. Code viết theo khối (block). Nếu sửa một lỗi nhỏ trong hàm, HÃY VIẾT LẠI TRỌN VẸN CẢ HÀM ĐÓ để tôi chỉ việc bôi đen và dán đè.
        4. AN TOÀN LOGIC: Tuyệt đối không làm hỏng logic liên quan. Không tự ý đổi tên các biến toàn cục đang hoạt động tốt. Không sử dụng các biến/hàm dễ gây hiểu lầm như email, user.
    `;

    var payload = {
        "contents": [{"parts": [{"text": promptHuanLuyen}]}],
        "generationConfig": { "temperature": 0.1 }
    };

    var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
    };

    try {
        var response = UrlFetchApp.fetch(url, options);
        var json = JSON.parse(response.getContentText());
        if (json.candidates && json.candidates.length > 0) {
            return { trangThai: 'thanh_cong', phanHoi: json.candidates[0].content.parts[0].text };
        } else {
            return { trangThai: 'loi', thongBao: "AI không thể đưa ra chẩn đoán lúc này." };
        }
    } catch (e) {
        return { trangThai: 'loi', thongBao: "Lỗi kết nối Gemini API: " + e.toString() };
    }
}
// =========================================================================
// KHỐI QUẢN TRỊ KHÓA SỔ ĐẦU BÀI THEO TUẦN (TOÀN TRƯỜNG)
// =========================================================================

// Hàm tách Mã Tuần thành { namHoc, tuan } hỗ trợ cả định dạng mới và cũ
// Mới: "2026-2027_Tuần 4" hoặc "2026-2027_4"
// Cũ: "4" hoặc "Tuần 4"
function tachMaTuanKhoa(chuoiMa) {
    if (!chuoiMa && chuoiMa !== 0) return { namHoc: '', tuan: 0 };
    var s = String(chuoiMa).trim();
    if (s.indexOf('_') !== -1) {
        var parts = s.split('_');
        var nam = parts[0].trim();
        var t = parseInt(parts.slice(1).join('_').replace(/\D/g, ''), 10) || 0;
        return { namHoc: nam, tuan: t };
    }
    var tGoc = parseInt(s.replace(/\D/g, ''), 10) || 0;
    return { namHoc: '', tuan: tGoc };
}

// Đọc danh sách các tuần đã khóa (có phân biệt theo năm học để chống nhầm lẫn năm sau)
function layTrangThaiKhoaSoDauBai(namHocChiDinh) {
    try {
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var namHocHienTai = namHocChiDinh || layNamHocHienTai(ss);
        var shKhoa = ss.getSheetByName('KHOA_SO_DAU_BAI');
        if (!shKhoa) return {};
        
        var lastRow = shKhoa.getLastRow();
        if (lastRow < 2) return {};
        
        var duLieu = shKhoa.getRange(2, 1, lastRow - 1, 5).getValues();
        var mapKhoa = {};
        
        for (var i = 0; i < duLieu.length; i++) {
            var thongTin = tachMaTuanKhoa(duLieu[i][0]);
            var tuan = thongTin.tuan;
            var namHocDong = thongTin.namHoc;
            var trangThai = String(duLieu[i][1]).trim().toUpperCase(); // 'KHOA' hoặc 'MO'
            
            if (tuan > 0) {
                // Nếu dòng có năm học thì phải khớp với năm học đang xét
                // Nếu dòng cũ chưa có năm học thì vẫn tương thích ngược cho năm học hiện tại
                if (!namHocDong || !namHocHienTai || namHocDong === namHocHienTai) {
                    mapKhoa[tuan] = {
                        daKhoa: (trangThai === 'KHOA'),
                        tuan: tuan,
                        namHoc: namHocDong || namHocHienTai,
                        maTuan: String(duLieu[i][0]).trim(),
                        nguoiThucHien: duLieu[i][2] || '',
                        thoiGian: duLieu[i][3] || '',
                        ghiChu: duLieu[i][4] || ''
                    };
                }
            }
        }
        return mapKhoa;
    } catch (e) {
        return {};
    }
}

// Kiểm tra quyền tài khoản được bấm nút khóa (Nhận diện thông minh cả Email lẫn Mã GV)
function kiemTraQuyenKhoaSo(emailTruyenVao) {
    var dinhDanhGuiLen = emailTruyenVao ? String(emailTruyenVao).trim().toLowerCase() : '';
    if (!dinhDanhGuiLen) {
        try {
            dinhDanhGuiLen = String(Session.getActiveUser().getEmail()).trim().toLowerCase();
        } catch(e) {}
    }
    if (!dinhDanhGuiLen) return false;

    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Tự động quy đổi để lấy ra cả 2: Email VÀ Mã GV tương ứng
    var emailChuan = dinhDanhGuiLen;
    var maGvChuan = dinhDanhGuiLen;

    var shDMGV = ss.getSheetByName('DM_GIAOVIEN');
    if (shDMGV) {
        var dataGV = shDMGV.getDataRange().getValues();
        for (var j = 1; j < dataGV.length; j++) {
            var maGVTrongBang = String(dataGV[j][0]).trim().toLowerCase();
            var emailTrongBang = (dataGV[j].length > 5 && dataGV[j][5]) ? String(dataGV[j][5]).trim().toLowerCase() : '';
            
            if (dinhDanhGuiLen === emailTrongBang && emailTrongBang !== '') {
                maGvChuan = maGVTrongBang;
                break;
            }
            if (dinhDanhGuiLen === maGVTrongBang && maGVTrongBang !== '') {
                if (emailTrongBang !== '') emailChuan = emailTrongBang;
                break;
            }
        }
    }

    // 2. Ban Giám hiệu / Quản trị viên trong CAI_DAT ĐƯƠNG NHIÊN CÓ QUYỀN
    var shCD = ss.getSheetByName('CAI_DAT');
    if (shCD) {
        var dataCD = shCD.getDataRange().getValues();
        for (var i = 1; i < dataCD.length; i++) {
            var adminEmail = String(dataCD[i][4]).trim().toLowerCase();
            if (adminEmail !== '' && (adminEmail === emailChuan || adminEmail === dinhDanhGuiLen || adminEmail === maGvChuan)) {
                return true; // Là BGH -> Luôn luôn được phép khóa/mở khóa
            }
        }
    }

    // 3. Kiểm tra trong Ma trận PHAN_QUYEN_ADMIN (Dành cho tài khoản được chỉ định)
    var shPQ = ss.getSheetByName('PHAN_QUYEN_ADMIN');
    if (shPQ && shPQ.getLastRow() > 1) {
        var dataPQ = shPQ.getRange(2, 1, shPQ.getLastRow() - 1, 4).getDisplayValues();
        for (var k = 0; k < dataPQ.length; k++) {
            var taiKhoanPQ = String(dataPQ[k][0]).trim().toLowerCase();
            if (taiKhoanPQ === emailChuan || taiKhoanPQ === dinhDanhGuiLen || taiKhoanPQ === maGvChuan) {
                var cacNut = String(dataPQ[k][2]).split(',').map(function(s){ return s.trim(); });
                if (cacNut.indexOf('btnKhoaSoDauBai') !== -1) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Xử lý Khóa/Mở khóa tuần
// Xử lý Khóa/Mở khóa tuần (Cột A Mã Tuần bổ sung yếu tố năm học: VD 2026-2027_Tuần 4)
function xuLyKhoaMoSoDauBai(payload) {
    var khoaHeThong = LockService.getScriptLock();
    try {
        khoaHeThong.waitLock(10000);
        
        var email = payload.emailTruyCap || '';
        if (!kiemTraQuyenKhoaSo(email)) {
            return { trangThai: 'loi_phan_quyen', thongBao: 'Từ chối: Tài khoản không có quyền Khóa/Mở khóa Sổ đầu bài trong Ma trận phân quyền!' };
        }

        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var namHoc = payload.namHoc ? String(payload.namHoc).trim() : layNamHocHienTai(ss);
        var tuan = parseInt(String(payload.tuan).replace(/\D/g, ''), 10);
        var thaoTacKhoa = payload.khoa === true; // true = Khóa toàn trường, false = Mở khóa
        
        var shKhoa = ss.getSheetByName('KHOA_SO_DAU_BAI');
        
        // Tự động tạo bảng nếu chưa có
        if (!shKhoa) {
            shKhoa = ss.insertSheet('KHOA_SO_DAU_BAI');
            shKhoa.getRange(1, 1, 1, 5).setValues([['Mã Tuần', 'Trạng Thái', 'Người Thực Hiện', 'Thời Gian', 'Ghi Chú']]).setFontWeight("bold").setBackground("#fee2e2");
        } else {
            var valHeader = String(shKhoa.getRange(1, 1).getValue()).trim();
            if (valHeader === 'Tuần') {
                shKhoa.getRange(1, 1).setValue('Mã Tuần');
            }
        }

        // Mã tuần bao gồm yếu tố năm học: VD "2026-2027_Tuần 4"
        var maTuanMoi = (namHoc ? (namHoc + '_') : '') + 'Tuần ' + tuan;

        var lastRow = shKhoa.getLastRow();
        var dongTimThay = -1;
        if (lastRow > 1) {
            var dsTuan = shKhoa.getRange(2, 1, lastRow - 1, 1).getValues();
            for (var i = 0; i < dsTuan.length; i++) {
                var thongTinDong = tachMaTuanKhoa(dsTuan[i][0]);
                if (thongTinDong.tuan === tuan) {
                    if (namHoc && thongTinDong.namHoc === namHoc) {
                        dongTimThay = i + 2;
                        break;
                    } else if (!thongTinDong.namHoc && dongTimThay === -1) {
                        dongTimThay = i + 2;
                    }
                }
            }
        }

        var thoiGianHienTai = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
        var trangThaiText = thaoTacKhoa ? 'KHOA' : 'MO';
        var ghiChuText = thaoTacKhoa ? 'Khóa tuần toàn trường' : 'Mở khóa tuần toàn trường';

        if (dongTimThay !== -1) {
            shKhoa.getRange(dongTimThay, 1, 1, 5).setValues([[maTuanMoi, trangThaiText, email, thoiGianHienTai, ghiChuText]]);
        } else {
            shKhoa.appendRow([maTuanMoi, trangThaiText, email, thoiGianHienTai, ghiChuText]);
        }

        SpreadsheetApp.flush();
        xoaCacheHeThongToanDien();

        var tenHienThiTuan = (namHoc ? ('Năm học ' + namHoc + ' - ') : '') + 'TUẦN ' + tuan;
        return {
            trangThai: 'thanh_cong',
            daKhoa: thaoTacKhoa,
            tuan: tuan,
            namHoc: namHoc,
            maTuan: maTuanMoi,
            thongBao: (thaoTacKhoa ? 'Đã KHÓA thành công' : 'Đã MỞ KHÓA thành công') + ' Sổ đầu bài ' + tenHienThiTuan + ' của TOÀN TRƯỜNG.'
        };
    } catch (loi) {
        return { trangThai: 'loi_he_thong', thongBao: 'Lỗi thực thi: ' + loi.toString() };
    } finally {
        khoaHeThong.releaseLock();
    }
}


// =========================================================================
// PHÂN HỆ: QUẢN LÝ KHÓA / MỞ KHÓA THỜI KHÓA BIỂU THEO TUẦN (KHOA_TKB)
// =========================================================================

// Đọc danh sách các tuần đã khóa Thời khóa biểu
function layTrangThaiKhoaTKB(ss, namHocChiDinh) {
    try {
        var bangTinh = ss || (typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet());
        var namHocHienTai = namHocChiDinh || layNamHocHienTai(bangTinh);
        var shKhoa = bangTinh.getSheetByName('KHOA_TKB');
        if (!shKhoa) return {};
        
        var lastRow = shKhoa.getLastRow();
        if (lastRow < 2) return {};
        
        var duLieu = shKhoa.getRange(2, 1, lastRow - 1, 5).getValues();
        var mapKhoa = {};
        
        for (var i = 0; i < duLieu.length; i++) {
            var thongTin = tachMaTuanKhoa(duLieu[i][0]);
            var tuan = thongTin.tuan;
            var namHocDong = thongTin.namHoc;
            var trangThai = String(duLieu[i][1]).trim().toUpperCase(); // 'KHOA' hoặc 'MO'
            
            if (tuan > 0) {
                if (!namHocDong || !namHocHienTai || namHocDong === namHocHienTai) {
                    mapKhoa[tuan] = {
                        daKhoa: (trangThai === 'KHOA'),
                        tuan: tuan,
                        namHoc: namHocDong || namHocHienTai,
                        maTuan: String(duLieu[i][0]).trim(),
                        nguoiThucHien: duLieu[i][2] || '',
                        thoiGian: duLieu[i][3] || '',
                        ghiChu: duLieu[i][4] || ''
                    };
                }
            }
        }
        return mapKhoa;
    } catch (e) {
        return {};
    }
}

// Kiểm tra quyền tài khoản được bấm nút khóa TKB (Admin trong CAI_DAT hoặc Ma trận PHAN_QUYEN_ADMIN)
function kiemTraQuyenKhoaTKB(emailTruyenVao) {
    var dinhDanhGuiLen = emailTruyenVao ? String(emailTruyenVao).trim().toLowerCase() : '';
    if (!dinhDanhGuiLen) {
        try {
            dinhDanhGuiLen = String(Session.getActiveUser().getEmail()).trim().toLowerCase();
        } catch(e) {}
    }
    if (!dinhDanhGuiLen) return false;

    var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Tự động quy đổi để lấy ra cả 2: Email VÀ Mã GV tương ứng
    var emailChuan = dinhDanhGuiLen;
    var maGvChuan = dinhDanhGuiLen;

    var shDMGV = ss.getSheetByName('DM_GIAOVIEN');
    if (shDMGV) {
        var dataGV = shDMGV.getDataRange().getValues();
        for (var j = 1; j < dataGV.length; j++) {
            var maGVTrongBang = String(dataGV[j][0]).trim().toLowerCase();
            var emailTrongBang = (dataGV[j].length > 5 && dataGV[j][5]) ? String(dataGV[j][5]).trim().toLowerCase() : '';
            
            if (dinhDanhGuiLen === emailTrongBang && emailTrongBang !== '') {
                maGvChuan = maGVTrongBang;
                break;
            }
            if (dinhDanhGuiLen === maGVTrongBang && maGVTrongBang !== '') {
                if (emailTrongBang !== '') emailChuan = emailTrongBang;
                break;
            }
        }
    }

    // 2. Ban Giám hiệu / Quản trị viên trong CAI_DAT ĐƯƠNG NHIÊN CÓ QUYỀN
    var shCD = ss.getSheetByName('CAI_DAT');
    if (shCD) {
        var dataCD = shCD.getDataRange().getValues();
        for (var i = 1; i < dataCD.length; i++) {
            var adminEmail = String(dataCD[i][4]).trim().toLowerCase();
            if (adminEmail !== '' && (adminEmail === emailChuan || adminEmail === dinhDanhGuiLen || adminEmail === maGvChuan)) {
                return true; // Là BGH -> Luôn luôn được phép khóa/mở khóa TKB
            }
        }
    }

    // 3. Kiểm tra trong Ma trận PHAN_QUYEN_ADMIN (Dành cho tài khoản được chỉ định hoặc công khai)
    var shPQ = ss.getSheetByName('PHAN_QUYEN_ADMIN');
    if (shPQ && shPQ.getLastRow() > 1) {
        var dataPQ = shPQ.getRange(2, 1, shPQ.getLastRow() - 1, 4).getDisplayValues();
        for (var k = 0; k < dataPQ.length; k++) {
            var taiKhoanPQ = String(dataPQ[k][0]).trim().toLowerCase();
            if (taiKhoanPQ === emailChuan || taiKhoanPQ === dinhDanhGuiLen || taiKhoanPQ === maGvChuan || taiKhoanPQ === '*' || taiKhoanPQ.indexOf('công khai') !== -1 || taiKhoanPQ.indexOf('congkhai') !== -1) {
                var cacNut = String(dataPQ[k][2]).split(',').map(function(s){ return s.trim(); });
                if (cacNut.indexOf('btnKhoaTKB') !== -1) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Xử lý Khóa/Mở khóa Thời khóa biểu theo Tuần
function xuLyKhoaMoTKB(payload) {
    var khoaHeThong = LockService.getScriptLock();
    try {
        khoaHeThong.waitLock(10000);
        
        var email = payload.emailTruyCap || '';
        if (!kiemTraQuyenKhoaTKB(email)) {
            return { trangThai: 'loi_phan_quyen', thongBao: 'Từ chối: Tài khoản không có quyền Khóa/Mở khóa Thời khóa biểu trong Ma trận phân quyền!' };
        }

        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var namHoc = payload.namHoc ? String(payload.namHoc).trim() : layNamHocHienTai(ss);
        var tuan = parseInt(String(payload.tuan).replace(/\D/g, ''), 10);
        var thaoTacKhoa = payload.khoa === true; // true = Khóa toàn trường, false = Mở khóa
        
        var shKhoa = ss.getSheetByName('KHOA_TKB');
        
        // Tự động tạo bảng nếu chưa có
        if (!shKhoa) {
            shKhoa = ss.insertSheet('KHOA_TKB');
            shKhoa.getRange(1, 1, 1, 5).setValues([['Mã Tuần', 'Trạng Thái', 'Người Thực Hiện', 'Thời Gian', 'Ghi Chú']]).setFontWeight("bold").setBackground("#fee2e2");
        } else {
            var valHeader = String(shKhoa.getRange(1, 1).getValue()).trim();
            if (valHeader === 'Tuần') {
                shKhoa.getRange(1, 1).setValue('Mã Tuần');
            }
        }

        var maTuanMoi = (namHoc ? (namHoc + '_') : '') + 'Tuần ' + tuan;

        var lastRow = shKhoa.getLastRow();
        var dongTimThay = -1;
        if (lastRow > 1) {
            var dsTuan = shKhoa.getRange(2, 1, lastRow - 1, 1).getValues();
            for (var i = 0; i < dsTuan.length; i++) {
                var thongTinDong = tachMaTuanKhoa(dsTuan[i][0]);
                if (thongTinDong.tuan === tuan) {
                    if (namHoc && thongTinDong.namHoc === namHoc) {
                        dongTimThay = i + 2;
                        break;
                    } else if (!thongTinDong.namHoc) {
                        dongTimThay = i + 2;
                        break;
                    }
                }
            }
        }

        var trangThaiChu = thaoTacKhoa ? 'KHOA' : 'MO';
        var thoiGianHienTai = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

        if (dongTimThay !== -1) {
            shKhoa.getRange(dongTimThay, 1, 1, 4).setValues([[maTuanMoi, trangThaiChu, email, thoiGianHienTai]]);
        } else {
            shKhoa.appendRow([maTuanMoi, trangThaiChu, email, thoiGianHienTai, '']);
        }

        SpreadsheetApp.flush();
        xoaCacheHeThongToanDien();

        var tenHienThiTuan = (namHoc ? ('Năm học ' + namHoc + ' - ') : '') + 'TUẦN ' + tuan;
        return {
            trangThai: 'thanh_cong',
            daKhoa: thaoTacKhoa,
            tuan: tuan,
            namHoc: namHoc,
            maTuan: maTuanMoi,
            thongBao: (thaoTacKhoa ? 'Đã KHÓA thành công' : 'Đã MỞ KHÓA thành công') + ' Thời khóa biểu ' + tenHienThiTuan + ' của TOÀN TRƯỜNG.'
        };
    } catch (loi) {
        return { trangThai: 'loi_he_thong', thongBao: 'Lỗi thực thi: ' + loi.toString() };
    } finally {
        khoaHeThong.releaseLock();
    }
}


// =========================================================================
// PHÂN HỆ: QUẢN LÝ DANH SÁCH NGƯỜI DÙNG ĐANG ONLINE THỜI GIAN THỰC (RAM CACHE)
// Không đọc/ghi xuống Google Sheets khi điểm danh, không dùng LockService
// Tự động xóa ngay lập tức khi nhận tín hiệu roiTrangOnline hoặc quá 45 giây
// =========================================================================
function layTuDienGiaoVienOnlineCache() {
    var cache = CacheService.getScriptCache();
    var keyMap = 'CACHE_TU_DIEN_GV_ONLINE_V3';
    var cached = cache.get(keyMap);
    if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
    }
    var mapGV = {};
    try {
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        var shGV = ss.getSheetByName('DM_GIAOVIEN');
        if (shGV && shGV.getLastRow() > 1) {
            var data = shGV.getRange(2, 1, shGV.getLastRow() - 1, 6).getDisplayValues();
            for (var i = 0; i < data.length; i++) {
                var ma = String(data[i][0] || '').trim();
                var ten = String(data[i][1] || '').trim();
                var toCM = String(data[i][2] || '').trim();
                var mail = String(data[i][5] || '').trim().toLowerCase();
                if (!ma && !ten) continue;
                var info = { maGv: ma || ten, hoTen: ten || ma, toChuyenMon: toCM, emailTruyCap: mail };
                if (ma) mapGV[ma.toLowerCase()] = info;
                if (mail) mapGV[mail] = info;
                if (ten) mapGV[ten.toLowerCase()] = info;
            }
        }
        cache.put(keyMap, JSON.stringify(mapGV), 600);
    } catch (e) {}
    return mapGV;
}

function ghiNhanHienDienTuDong(dinhDanhRaw, tenGoiY, maGvGoiY, toCmGoiY, xoaKhoiDanhSach) {
    try {
        var raw = String(dinhDanhRaw || maGvGoiY || '').trim();
        if (!raw) return;
        var cache = CacheService.getScriptCache();
        var cacheKey = 'CACHE_DANH_SACH_ONLINE_V3';
        var strData = cache.get(cacheKey);
        var mapOnline = strData ? JSON.parse(strData) : {};
        var now = new Date().getTime();
        var ttlMs = 45000; // Cửa sổ 45 giây: tự động loại bỏ nếu mất kết nối đột ngột

        var tuDienGV = layTuDienGiaoVienOnlineCache();
        var rawLC = raw.toLowerCase();
        var matched = tuDienGV[rawLC] || (maGvGoiY ? tuDienGV[String(maGvGoiY).trim().toLowerCase()] : null);

        var maChuan = matched ? matched.maGv : (maGvGoiY || (raw.indexOf('@') !== -1 ? raw.split('@')[0].toUpperCase() : raw));
        var tenChuan = matched ? matched.hoTen : (tenGoiY || raw);
        var toCmChuan = matched ? matched.toChuyenMon : (toCmGoiY || 'Giáo viên');
        var keyUser = String(maChuan).trim().toUpperCase();

        if (xoaKhoiDanhSach) {
            delete mapOnline[keyUser];
            // Xóa triệt để cả các khóa phụ nếu trùng emailTruyCap
            for (var kDel in mapOnline) {
                if (mapOnline[kDel] && String(mapOnline[kDel].emailTruyCap || '').trim().toLowerCase() === rawLC) {
                    delete mapOnline[kDel];
                }
            }
        } else {
            mapOnline[keyUser] = {
                maGv: maChuan,
                hoTen: tenChuan,
                toChuyenMon: toCmChuan,
                emailTruyCap: raw,
                capNhatLuc: now
            };
        }

        var mapSach = {};
        for (var k in mapOnline) {
            if (now - (mapOnline[k].capNhatLuc || 0) <= ttlMs) {
                mapSach[k] = mapOnline[k];
            }
        }
        cache.put(cacheKey, JSON.stringify(mapSach), 120);
    } catch (e) {}
}

function xuLyCheckOnlineMayChu(params) {
    try {
        var thaoTac = params && params.thaoTac ? String(params.thaoTac).trim() : 'checkOnline';
        var emailHoacMa = params ? (params.emailTruyCap || params.maGv || '') : '';
        var tenGoiY = params && params.hoTen ? params.hoTen : (params && params.tenGoiY ? params.tenGoiY : '');
        var maGvGoiY = params && params.maGv ? params.maGv : '';
        var toCmGoiY = params && params.toChuyenMon ? params.toChuyenMon : '';

        if (emailHoacMa) {
            ghiNhanHienDienTuDong(emailHoacMa, tenGoiY, maGvGoiY, toCmGoiY, thaoTac === 'roiTrangOnline');
        }

        if (thaoTac === 'roiTrangOnline' || thaoTac === 'diemDanhOnline') {
            return { trangThai: 'thanh_cong', daXoa: (thaoTac === 'roiTrangOnline') };
        }

        var cache = CacheService.getScriptCache();
        var cacheKey = 'CACHE_DANH_SACH_ONLINE_V3';
        var strData = cache.get(cacheKey);
        var mapOnline = strData ? JSON.parse(strData) : {};
        var now = new Date().getTime();
        var ttlMs = 45000;

        var danhSach = [];
        var mapSach = {};
        for (var k in mapOnline) {
            if (now - (mapOnline[k].capNhatLuc || 0) <= ttlMs) {
                mapSach[k] = mapOnline[k];
                danhSach.push(mapOnline[k]);
            }
        }
        cache.put(cacheKey, JSON.stringify(mapSach), 120);

        return {
            trangThai: 'thanh_cong',
            danhSachOnline: danhSach
        };
    } catch (e) {
        return { trangThai: 'thanh_cong', danhSachOnline: [] };
    }
}
// =========================================================================
// HÀM MỚI: XỬ LÝ CHUYỂN TUẦN ĐỒNG BỘ TỪ SERVER (BẢO TOÀN 100% LỚP)
// Tự động kiểm tra tích lũy 12 tiết AI/năm và chuyển AI -> TC Toán / TC TV
// =========================================================================
function xuLyChuyenTuanTiepTheoDongBo(payload) {
    var khoaHeThong = LockService.getScriptLock();
    try {
        khoaHeThong.waitLock(15000);
        var ss = typeof ID_BANG_TINH_TKB !== 'undefined' ? SpreadsheetApp.openById(ID_BANG_TINH_TKB) : SpreadsheetApp.getActiveSpreadsheet();
        
        // Nếu TKB_HIEN_TAI đang trống thì tự động khởi tạo Tuần 1 từ TKB_CoDinh và Thứ 2 từ CAI_DAT trước
        damBaoTkbHienTaiKhiTrong(ss);

        var namHocHienTai = layNamHocHienTai(ss);
        var dinhMucAiNam = 12; // Định mức chuẩn 12 tiết AI / năm học
        
        var shHT = ss.getSheetByName('TKB_HIEN_TAI');
        var shData = ss.getSheetByName('DATA_TKB');
        var shCD = ss.getSheetByName('TKB_CoDinh');
        var shCaiDat = ss.getSheetByName('CAI_DAT');
        
        var tieuDeChuan = ['Mã Tiết', 'Năm học', 'Tuần', 'Thứ', 'Buổi', 'Tiết', 'Mã Lớp', 'Môn Học', 'Mã GV', 'Tháng', 'Ngày', 'Trạng thái'];
        var soCot = tieuDeChuan.length;
        if (!shData) {
            shData = ss.insertSheet('DATA_TKB');
            shData.getRange(1, 1, 1, soCot).setValues([tieuDeChuan]).setFontWeight("bold").setBackground("#e2e8f0");
        }
        
        // 1. Quét dữ liệu TKB_HIEN_TAI để xác định Tuần hiện tại (tuanCu) và Ngày Thứ 2 của tuần hiện tại (dThu2Cu)
        var lastRowHT = shHT ? shHT.getLastRow() : 0;
        var dataHT = [];
        var dispHT = [];
        var tuanCu = 0;
        var dThu2Cu = null;

        if (lastRowHT > 1) {
            dataHT = shHT.getRange(2, 1, lastRowHT - 1, soCot).getValues();
            dispHT = shHT.getRange(2, 1, lastRowHT - 1, soCot).getDisplayValues();
            for (var i = 0; i < dataHT.length; i++) {
                var tDong = parseInt(String(dispHT[i][2] || '').replace(/\D/g, ''), 10);
                if (!isNaN(tDong) && tDong > tuanCu) tuanCu = tDong;

                if (!dThu2Cu && (dataHT[i][10] || dispHT[i][10])) {
                    var dObj = parseNgayTkbAnToan(dataHT[i][10], dispHT[i][10]);
                    if (dObj && !isNaN(dObj.getTime())) {
                        var offset = tinhDoLechThuTkb(dispHT[i][3]);
                        dThu2Cu = duaNgayVeThu2(new Date(dObj.getFullYear(), dObj.getMonth(), dObj.getDate() - offset));
                    }
                }
            }
        }

        if (tuanCu <= 0) {
            if (payload && payload.tuanCu) {
                tuanCu = parseInt(payload.tuanCu, 10) || 1;
            } else {
                tuanCu = 1;
            }
        }

        // Nếu trên TKB_HIEN_TAI chưa có ngày cột K, lấy từ payload.ngayDauTuanUI hoặc từ CAI_DAT
        if (!dThu2Cu && payload && payload.ngayDauTuanUI) {
            var dPayload = parseNgayTkbAnToan(payload.ngayDauTuanUI, payload.ngayDauTuanUI);
            if (dPayload) dThu2Cu = duaNgayVeThu2(dPayload);
        }
        if (!dThu2Cu) {
            var infoCD = layNgayThu2DauTuanTuCaiDat(ss);
            if (infoCD && infoCD.dateObj) {
                dThu2Cu = duaNgayVeThu2(new Date(infoCD.dateObj.getFullYear(), infoCD.dateObj.getMonth(), infoCD.dateObj.getDate() + (tuanCu - 1) * 7));
            }
        }

        // Lưu trữ toàn bộ dữ liệu Tuần hiện tại (tuanCu) từ TKB_HIEN_TAI vào DATA_TKB (chống trùng lặp tuần trong cùng năm học)
        var mangGhiData = [tieuDeChuan];
        if (dataHT.length > 0) {
            var mangLuuTru = [];
            for (var r = 0; r < dataHT.length; r++) {
                var maLopR = String(dispHT[r][6] || '').trim();
                var monHocR = String(dispHT[r][7] || '').trim();
                if (maLopR !== '' && monHocR !== '') {
                    var thuR = String(dispHT[r][3] || '').trim();
                    var thangR = String(dispHT[r][9] || '').trim();
                    var ngayR = '';
                    var dR = parseNgayTkbAnToan(dataHT[r][10], dispHT[r][10]);
                    if (dR) {
                        var infR = dinhDangThongTinNgay(dR);
                        ngayR = infR.dmy;
                        if (!thangR) thangR = infR.thang;
                    } else if (dThu2Cu) {
                        var offR = tinhDoLechThuTkb(thuR);
                        var infR2 = dinhDangThongTinNgay(new Date(dThu2Cu.getFullYear(), dThu2Cu.getMonth(), dThu2Cu.getDate() + offR));
                        if (infR2) {
                            ngayR = infR2.dmy;
                            thangR = infR2.thang;
                        }
                    }
                    var nhR = String(dispHT[r][1] || '').trim() || namHocHienTai;
                    var ttR = (dispHT[r].length > 11 && dispHT[r][11]) ? String(dispHT[r][11]).trim() : '';
                    mangLuuTru.push([dispHT[r][0], nhR, tuanCu, thuR, dispHT[r][4], dispHT[r][5], maLopR, monHocR, dispHT[r][8], thangR, ngayR, ttR]);
                }
            }

            if (mangLuuTru.length > 0) {
                var lrData = shData.getLastRow();
                if (lrData > 1) {
                    var dataCuData = shData.getRange(1, 1, lrData, soCot).getValues();
                    for (var dIdx = 1; dIdx < dataCuData.length; dIdx++) {
                        var tData = parseInt(String(dataCuData[dIdx][2] || '').replace(/\D/g, ''), 10);
                        var nhData = String(dataCuData[dIdx][1] || '').trim();
                        if (tData !== tuanCu || (nhData !== '' && namHocHienTai !== '' && nhData !== namHocHienTai)) {
                            mangGhiData.push(dataCuData[dIdx]);
                        }
                    }
                }
                for (var mIdx = 0; mIdx < mangLuuTru.length; mIdx++) {
                    mangGhiData.push(mangLuuTru[mIdx]);
                }
                shData.getRange(1, 1, mangGhiData.length, soCot).setValues(mangGhiData);
                if (lrData > mangGhiData.length) {
                    shData.getRange(mangGhiData.length + 1, 1, lrData - mangGhiData.length, soCot).clearContent();
                }
            }
        }

        // 2. Tịnh tiến tuần (+1) và thời gian (+7 ngày) trực tiếp từ tuần hiện tại
        var tuanMoi = tuanCu + 1;
        var ngayThu2Goc = null;
        if (dThu2Cu) {
            ngayThu2Goc = duaNgayVeThu2(new Date(dThu2Cu.getFullYear(), dThu2Cu.getMonth(), dThu2Cu.getDate() + 7));
        }

        // =====================================================================
        // [NÂNG CẤP]: ĐẾM TÍCH LŨY TIẾT AI & CHUẨN BỊ DỮ LIỆU CHUYỂN ĐỔI VỀ TC TOÁN / TC TV
        // =====================================================================
        function laMonAI_Server(tenMon) {
            if (!tenMon) return false;
            var s = String(tenMon).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
            return (s === 'ai' || s.indexOf('ai ') === 0 || s.slice(-3) === ' ai' || s.indexOf('trí tuệ nhân tạo') !== -1 || s.indexOf('tri tue nhan tao') !== -1);
        }

        function laMonTcToan_Server(tenMon) {
            if (!tenMon) return false;
            var s = String(tenMon).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
            var sKd = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
            return ((s.indexOf('tc') === 0 || s.indexOf('tăng cường') !== -1 || sKd.indexOf('tang cuong') !== -1) && (s.indexOf('toán') !== -1 || sKd.indexOf('toan') !== -1));
        }

        function laMonTcTV_Server(tenMon) {
            if (!tenMon) return false;
            var s = String(tenMon).normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
            var sKd = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
            return ((s.indexOf('tc') === 0 || s.indexOf('tăng cường') !== -1 || sKd.indexOf('tang cuong') !== -1) && (s.indexOf('tv') !== -1 || s.indexOf('tiếng việt') !== -1 || sKd.indexOf('tieng viet') !== -1));
        }

        // 2a. Đếm tổng số tiết AI đã học của từng lớp từ Tuần 1 đến hết tuanCu (từ mangGhiData hoặc shData)
        var demAiTichLuyTheoLop = {};
        var nguonLichSu = (mangGhiData.length > 1) ? mangGhiData : ((shData && shData.getLastRow() > 1) ? shData.getRange(1, 1, shData.getLastRow(), soCot).getValues() : []);
        for (var h = 1; h < nguonLichSu.length; h++) {
            var tLichSu = parseInt(String(nguonLichSu[h][2] || '').replace(/\D/g, ''), 10);
            var nhLichSu = String(nguonLichSu[h][1] || '').trim();
            if (namHocHienTai && nhLichSu && nhLichSu !== namHocHienTai) continue;
            if (!isNaN(tLichSu) && tLichSu < tuanMoi) {
                var lopLS = String(nguonLichSu[h][6] || '').trim();
                var monLS = String(nguonLichSu[h][7] || '').trim();
                if (lopLS && laMonAI_Server(monLS)) {
                    demAiTichLuyTheoLop[lopLS] = (demAiTichLuyTheoLop[lopLS] || 0) + 1;
                }
            }
        }

        // 2b. Lấy tên môn chuẩn (TC Toán, TC TV) từ KHUNG_CHUONG_TRINH, bảng PHAN_CONG và GVCN từ DM_LOP
        var tenChuanTcToan = 'TC Toán';
        var tenChuanTcTV = 'TC TV';
        var dsMonKhung = docDanhSachMonHoc();
        for (var mIdx2 = 0; mIdx2 < dsMonKhung.length; mIdx2++) {
            if (laMonTcToan_Server(dsMonKhung[mIdx2])) tenChuanTcToan = dsMonKhung[mIdx2];
            if (laMonTcTV_Server(dsMonKhung[mIdx2])) tenChuanTcTV = dsMonKhung[mIdx2];
        }

        var mapPhanCong = docPhanCong();
        var mapGvcnLop = {};
        var shLopDM = ss.getSheetByName('DM_LOP');
        if (shLopDM && shLopDM.getLastRow() > 1) {
            var dataLopDM = shLopDM.getRange(2, 1, shLopDM.getLastRow() - 1, 3).getDisplayValues();
            for (var lIdx = 0; lIdx < dataLopDM.length; lIdx++) {
                var maLopDM = String(dataLopDM[lIdx][0] || '').trim();
                if (maLopDM) mapGvcnLop[maLopDM] = String(dataLopDM[lIdx][2] || '').trim();
            }
        }

        // 3. Nạp dữ liệu từ TKB_CoDinh sang TKB_HIEN_TAI cho Tuần mới kèm Tuần và Thời gian mới
        var mangMoi = [tieuDeChuan];
        var dsTkbMoi = [];
        var dsLopDaChuyenAI = [];

        if (shCD && shCD.getLastRow() > 1) {
            var dataCD = shCD.getRange(2, 1, shCD.getLastRow() - 1, soCot).getDisplayValues();

            // Quét trước TKB_CoDinh để biết số tiết TC Toán / TC TV hiện có của từng lớp và GV đang dạy
            var demTcCoDinh = {};
            var gvDayTcTrongCoDinh = {};
            for (var p = 0; p < dataCD.length; p++) {
                var lopP = String(dataCD[p][6] || '').trim();
                var monP = String(dataCD[p][7] || '').trim();
                var gvP = String(dataCD[p][8] || '').trim();
                if (!lopP || !monP) continue;
                if (!demTcCoDinh[lopP]) demTcCoDinh[lopP] = { tcToan: 0, tcTV: 0 };
                if (!gvDayTcTrongCoDinh[lopP]) gvDayTcTrongCoDinh[lopP] = { tcToan: '', tcTV: '', gvChinh: '' };

                if (laMonTcToan_Server(monP)) {
                    demTcCoDinh[lopP].tcToan++;
                    if (gvP && !gvDayTcTrongCoDinh[lopP].tcToan) gvDayTcTrongCoDinh[lopP].tcToan = gvP;
                } else if (laMonTcTV_Server(monP)) {
                    demTcCoDinh[lopP].tcTV++;
                    if (gvP && !gvDayTcTrongCoDinh[lopP].tcTV) gvDayTcTrongCoDinh[lopP].tcTV = gvP;
                } else {
                    var monPLower = monP.toLowerCase();
                    if ((monPLower === 'toán' || monPLower === 'tiếng việt') && gvP && !gvDayTcTrongCoDinh[lopP].gvChinh) {
                        gvDayTcTrongCoDinh[lopP].gvChinh = gvP;
                    }
                }
            }

            // Hàm tìm Giáo viên dạy môn TC Toán / TC TV cho lớp khi chuyển từ AI về
            function timGvDayMonTangCuong(maLop, tenMonTC, laTcToan) {
                var pcLop = mapPhanCong[maLop] || {};
                if (pcLop[tenMonTC]) return pcLop[tenMonTC];
                for (var kMon in pcLop) {
                    if (laTcToan && laMonTcToan_Server(kMon) && pcLop[kMon]) return pcLop[kMon];
                    if (!laTcToan && laMonTcTV_Server(kMon) && pcLop[kMon]) return pcLop[kMon];
                }
                var infoGvCD = gvDayTcTrongCoDinh[maLop] || {};
                if (laTcToan && infoGvCD.tcToan) return infoGvCD.tcToan;
                if (!laTcToan && infoGvCD.tcTV) return infoGvCD.tcTV;
                if (infoGvCD.tcToan) return infoGvCD.tcToan;
                if (infoGvCD.tcTV) return infoGvCD.tcTV;
                if (mapGvcnLop[maLop]) return mapGvcnLop[maLop];
                if (infoGvCD.gvChinh) return infoGvCD.gvChinh;
                return '';
            }

            for (var j = 0; j < dataCD.length; j++) {
                var maLopCD = String(dataCD[j][6] || '').trim();
                var monHocCD = String(dataCD[j][7] || '').trim();
                if (maLopCD !== '' && monHocCD !== '') {
                    var thuCD = String(dataCD[j][3] || '').trim();
                    var buoiCD = String(dataCD[j][4] || '').trim();
                    var tietCD = String(dataCD[j][5] || '').trim();
                    var maGvCD = String(dataCD[j][8] || '').trim();
                    var nhCD = String(dataCD[j][1] || '').trim() || namHocHienTai;

                    // [KIỂM TRA & TỰ ĐỘNG ĐỔI MÔN AI VỀ TC TOÁN / TC TV NẾU ĐÃ ĐỦ 12 TIẾT/NĂM]:
                    if (laMonAI_Server(monHocCD)) {
                        var daHocAI = demAiTichLuyTheoLop[maLopCD] || 0;
                        if (daHocAI >= dinhMucAiNam) {
                            var tkTc = demTcCoDinh[maLopCD] || { tcToan: 0, tcTV: 0 };
                            // Ưu tiên chọn môn Tăng cường đang có số tiết ít hơn để cân bằng (nếu bằng nhau thì ưu tiên TC Toán)
                            var chonTcToan = (tkTc.tcToan <= tkTc.tcTV);
                            var monThayThe = chonTcToan ? tenChuanTcToan : tenChuanTcTV;
                            var gvThayThe = timGvDayMonTangCuong(maLopCD, monThayThe, chonTcToan);

                            var monCuGoc = monHocCD;
                            monHocCD = monThayThe;
                            if (gvThayThe) maGvCD = gvThayThe;

                            if (chonTcToan) tkTc.tcToan++; else tkTc.tcTV++;
                            demTcCoDinh[maLopCD] = tkTc;

                            dsLopDaChuyenAI.push(maLopCD + ' (' + monCuGoc + ' ➔ ' + monHocCD + ')');
                        } else {
                            // Nếu chưa đủ 12 tiết thì giữ nguyên tiết AI và cộng nhẩm tích lũy
                            demAiTichLuyTheoLop[maLopCD] = daHocAI + 1;
                        }
                    }

                    var tienTo = (buoiCD === "Sáng") ? "S" : "C";
                    var maTietMoi = nhCD + "_" + tuanMoi + "_" + thuCD + "_" + tienTo + "_" + tietCD + "_" + maLopCD;

                    var thangMoi = '';
                    var ngayMoi = '';
                    if (ngayThu2Goc) {
                        var offsetNgay = tinhDoLechThuTkb(thuCD);
                        var dTinh = new Date(ngayThu2Goc.getFullYear(), ngayThu2Goc.getMonth(), ngayThu2Goc.getDate() + offsetNgay);
                        var infMoi = dinhDangThongTinNgay(dTinh);
                        if (infMoi) {
                            thangMoi = infMoi.thang;
                            ngayMoi = infMoi.dmy;
                        }
                    }

                    mangMoi.push([maTietMoi, nhCD, tuanMoi, thuCD, buoiCD, tietCD, maLopCD, monHocCD, maGvCD, thangMoi, ngayMoi, '']);
                    dsTkbMoi.push({
                        maTiet: maTietMoi, namHoc: nhCD, tuan: tuanMoi, thu: thuCD,
                        buoi: buoiCD, tiet: tietCD, maLop: maLopCD, monHoc: monHocCD,
                        maGv: maGvCD, thang: thangMoi, ngay: ngayMoi
                    });
                }
            }
        }
        
        shHT.clearContents();
        shHT.getRange(1, 1, mangMoi.length, soCot).setValues(mangMoi);
        
        // 4. Tịnh tiến TUAN_HIEN_TAI trong CÀI ĐẶT
        if (shCaiDat && shCaiDat.getLastRow() > 1) {
            var dataCDat2 = shCaiDat.getDataRange().getDisplayValues();
            for (var k = 0; k < dataCDat2.length; k++) {
                if (String(dataCDat2[k][0] || '').trim().toUpperCase() === 'TUAN_HIEN_TAI') {
                    shCaiDat.getRange(k + 1, 2).setValue(tuanMoi);
                    break;
                }
            }
        }
        
        SpreadsheetApp.flush();
        if (typeof xoaCacheHeThongToanDien === 'function') xoaCacheHeThongToanDien();
        
        var infoThu2Moi = ngayThu2Goc ? dinhDangThongTinNgay(ngayThu2Goc) : null;
        return {
            trangThai: 'thanh_cong',
            tuanMoi: tuanMoi,
            ngayThu2Moi: infoThu2Moi ? infoThu2Moi.dmy : '',
            ngayThu2MoiYMD: infoThu2Moi ? infoThu2Moi.ymd : '',
            duLieuTkbMoi: dsTkbMoi,
            dsLopDaChuyenAI: dsLopDaChuyenAI,
            thongBao: 'Đã chuyển sang Tuần ' + tuanMoi + ' và tịnh tiến thời gian đồng bộ từ tuần hiện tại.'
        };
    } catch (loi) {
        return { trangThai: 'loi_he_thong', thongBao: loi.toString() };
    } finally {
        khoaHeThong.releaseLock();
    }
}
