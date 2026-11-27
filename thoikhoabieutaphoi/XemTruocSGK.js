let boNhoHocLieuSGK = {}; 
let theHienPdfHienTai = null;
let trangHienTaiPDF = 1;
let heSoThuPhong = 1.2;
let idTepHienTai = '';

let boNhoTrangPdfGiaiMa = {}; // RAM đệm giúp lật trang đã xem siêu mượt
let boNhoChiMucPdf = {}; // RAM đệm cấu trúc dòng văn bản theo idPdf: { [idPdf]: { [soTrang]: lines[] } }
let ketQuaHighlightHienTai = null; // { trang, topPct, leftPct, widthPct, heightPct }
let thongTinBaiHocHienTai = { khoi: '', mon: '', bai: '', idKy1: '', idKy2: '', kyDangXem: 1 };

document.addEventListener('DOMContentLoaded', () => {
    xayDungKhungGiaoDienXemTruoc();
    khoiTaoBoNhoHocLieu().catch(loi => console.warn("Chưa tải được danh mục SGK:", loi));   
});

// =========================================================================
// KHỐI 1: CƠ SỞ DỮ LIỆU INDEXEDDB (THUẬT TOÁN ĐỒNG BỘ PROMISE CHỐNG VƯỢT MẶT)
// =========================================================================
const dbHocLieuPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("KhoHocLieuSoDB", 15);
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (db.objectStoreNames.contains("BangTepPDF")) {
            db.deleteObjectStore("BangTepPDF");
        }
        db.createObjectStore("BangTepPDF", { keyPath: "idPdf" });
        if (db.objectStoreNames.contains("BangMucLucScan")) {
            db.deleteObjectStore("BangMucLucScan");
        }
        db.createObjectStore("BangMucLucScan", { keyPath: "idPdf" });
    };
    request.onsuccess = function(event) { resolve(event.target.result); };
    request.onerror = function(event) { console.warn("Lỗi IndexedDB"); resolve(null); };
});

async function luuTepVaoBoNhoCucBo(idPdf, mangByte, laLoi = false) {
    const db = await dbHocLieuPromise;
    if (!db) return;
    try {
        const transaction = db.transaction(["BangTepPDF"], "readwrite");
        const store = transaction.objectStore("BangTepPDF");
        store.put({ idPdf: idPdf, duLieu: mangByte, loi: laLoi, thoiGian: new Date().getTime() });
    } catch (e) { console.warn("Đầy bộ nhớ cục bộ:", e); }
}

async function docTepTuBoNhoCucBo(idPdf) {
    const db = await dbHocLieuPromise;
    if (!db) return null;
    return new Promise((resolve) => {
        const transaction = db.transaction(["BangTepPDF"], "readonly");
        const store = transaction.objectStore("BangTepPDF");
        const request = store.get(idPdf);
        request.onsuccess = function(event) { resolve(request.result || null); };
        request.onerror = function() { resolve(null); };
    });
}

async function luuMucLucScanVaoDB(idPdf, dsMucLuc) {
    const db = await dbHocLieuPromise;
    if (!db || !db.objectStoreNames.contains("BangMucLucScan")) return;
    try {
        const transaction = db.transaction(["BangMucLucScan"], "readwrite");
        transaction.objectStore("BangMucLucScan").put({
            idPdf: idPdf,
            dsMucLuc: dsMucLuc,
            thoiGian: new Date().getTime()
        });
    } catch (e) { console.warn("Không thể lưu chỉ mục scan:", e); }
}

async function docMucLucScanTuDB(idPdf) {
    const db = await dbHocLieuPromise;
    if (!db || !db.objectStoreNames.contains("BangMucLucScan")) return null;
    return new Promise((resolve) => {
        const transaction = db.transaction(["BangMucLucScan"], "readonly");
        const request = transaction.objectStore("BangMucLucScan").get(idPdf);
        request.onsuccess = (event) => resolve(event.target.result ? event.target.result.dsMucLuc : null);
        request.onerror = () => resolve(null);
    });
}

async function xoaBoNhoDemCu(idPdfMoi) {
    const db = await dbHocLieuPromise;
    if (!db) return;
    return new Promise((resolve) => {
        const transaction = db.transaction(["BangTepPDF"], "readwrite");
        const store = transaction.objectStore("BangTepPDF");
        const request = store.getAllKeys();
        
        request.onsuccess = function(event) {
            const danhSachIdCu = event.target.result;
            danhSachIdCu.forEach(idCu => {
                if (idCu !== idPdfMoi) { store.delete(idCu); }
            });
            resolve();
        };
        request.onerror = () => resolve();
    });
}

async function lamMoiBoNhoDemPdf() {
    if (!idTepHienTai) return;
    const db = await dbHocLieuPromise;
    if (db) {
        const stores = ["BangTepPDF"];
        if (db.objectStoreNames.contains("BangMucLucScan")) stores.push("BangMucLucScan");
        const transaction = db.transaction(stores, "readwrite");
        transaction.objectStore("BangTepPDF").delete(idTepHienTai);
        if (db.objectStoreNames.contains("BangMucLucScan")) {
            transaction.objectStore("BangMucLucScan").delete(idTepHienTai);
        }
    }
    
    boNhoTrangPdfGiaiMa = {};
    delete boNhoChiMucPdf[idTepHienTai];
    ketQuaHighlightHienTai = null;
    hienThiKhoiChoTai(`Đang tải lại bản gốc sách mới nhất...`);
    xuLyDocPDF(idTepHienTai, thongTinBaiHocHienTai.bai);
}

// =========================================================================
// KHỐI 2: ĐỌC DỮ LIỆU TỪ MÁY CHỦ (BỘ LỌC CHỐNG LỖI TỐI ĐA)
// =========================================================================
async function khoiTaoBoNhoHocLieu() {
    try {
        const fetchFunc = (typeof fetchVoiCoCheThuLai === 'function') ? fetchVoiCoCheThuLai : fetch;
        const phanHoi = await fetchFunc(`${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=layDanhMucSGK`);
        if (!phanHoi.ok) throw new Error(`Lỗi HTTP: ${phanHoi.status}`);
        
        const duLieu = await phanHoi.json();
        let mangDuLieu = [];
        if (Array.isArray(duLieu)) mangDuLieu = duLieu;
        else if (duLieu && Array.isArray(duLieu.data)) mangDuLieu = duLieu.data;
        else throw new Error("Dữ liệu trả về không đúng cấu trúc mảng.");

        let dongBatDau = (mangDuLieu.length > 0 && String(mangDuLieu[0][0]).toLowerCase().includes('khối')) ? 1 : 0;

        for (let i = dongBatDau; i < mangDuLieu.length; i++) {
            let dong = mangDuLieu[i];
            let tenKhoi = dong[0] ? String(dong[0]).trim().toUpperCase() : '';
            let tenMon = dong[1] ? String(dong[1]).trim().replace(/\s+/g, '').toLowerCase() : '';
            
            let linkKy1 = (dong.length > 2 && dong[2]) ? String(dong[2]).trim() : ''; 
            let linkKy2 = (dong.length > 3 && dong[3]) ? String(dong[3]).trim() : ''; 
            
            if (tenKhoi && tenMon && (linkKy1 || linkKy2)) {
                let khoaTruyXuat = `${tenKhoi}_${tenMon}`;
                boNhoHocLieuSGK[khoaTruyXuat] = {
                    linkKy1: linkKy1,
                    linkKy2: linkKy2 !== '' ? linkKy2 : linkKy1 
                };
            }
        }
    } catch (loi) { 
        console.error("Chi tiết lỗi tải Danh mục SGK:", loi);
        throw loi; 
    }
}

function trichXuatIdTuLink(url) {
    let ketQua = String(url || '').match(/[-\w]{25,}/);
    return ketQua ? ketQua[0] : null;
}

// =========================================================================
// KHỐI 3: THUẬT TOÁN ĐIỀU HƯỚNG VÀ KIỂM SOÁT KỲ HỌC (CHUẨN V20)
// =========================================================================
window.kichHoatXemTruocSGK = async function(tenKhoiGoc, tenMonGoc, tenBaiHoc, thamSoTuan) {
    const tenKhoiChuan = String(tenKhoiGoc).trim().toUpperCase();
    const tenMonChuan = String(tenMonGoc).trim().replace(/\s+/g, '').toLowerCase();
    
    let tenMonGocChuan = tenMonChuan;
    const match = tenMonChuan.match(/^(.*?)(\d+)$/);
    if (match) {
        tenMonGocChuan = match[1];
    }

    const khoaTimKiem = `${tenKhoiChuan}_${tenMonChuan}`;
    const khoaTimKiemGoc = `${tenKhoiChuan}_${tenMonGocChuan}`;

    let tuanHienTai = 1; 
    if (thamSoTuan != null && typeof thamSoTuan !== 'object') {
        let matchTuan = String(thamSoTuan).match(/\d+/);
        if (matchTuan) tuanHienTai = parseInt(matchTuan[0], 10);
    } else {
        let dsIdChuan = ['locTuanUI', 'tuan', 'cboTuan', 'tuanHoc', 'chonTuan', 'Tuan', 'TuanHoc'];
        let oNhapTuan = null;
        for (let id of dsIdChuan) {
            oNhapTuan = document.getElementById(id);
            if (oNhapTuan) break;
        }
        if (oNhapTuan) {
            let giaTriChu = (oNhapTuan.tagName === 'SELECT') ? oNhapTuan.options[oNhapTuan.selectedIndex].text : oNhapTuan.value;
            let matchTuan = String(giaTriChu).match(/\d+/);
            if (matchTuan) tuanHienTai = parseInt(matchTuan[0], 10);
        }
    }
    
    if (tuanHienTai < 1) tuanHienTai = 1;

    if (Object.keys(boNhoHocLieuSGK).length === 0) {
        console.log("Đang kết nối thư viện Sách giáo khoa...");
        try {
            await khoiTaoBoNhoHocLieu();
        } catch (loi) {
            alert(`Sự cố mạng hoặc cấu hình API: ${loi.message}`);
            return;
        }
    }

    let duLieuMonHoc = boNhoHocLieuSGK[khoaTimKiem] || boNhoHocLieuSGK[khoaTimKiemGoc];

    if (!duLieuMonHoc || (!duLieuMonHoc.linkKy1 && !duLieuMonHoc.linkKy2)) {
        alert(`Chưa thiết lập tài liệu SGK cho - Môn ${tenMonGoc} trên máy chủ.`);
        return;
    }

    let kyHocPhanDong = (tuanHienTai > 18) ? 2 : 1;
    let linkTepHienTai = (kyHocPhanDong === 2) ? duLieuMonHoc.linkKy2 : duLieuMonHoc.linkKy1;
    
    if (!linkTepHienTai) {
        alert(`Tài liệu Tập ${kyHocPhanDong} của môn này chưa được cấu hình Link.`);
        return;
    }

    let idPdf = trichXuatIdTuLink(linkTepHienTai);
    if (!idPdf) {
        window.open(linkTepHienTai, '_blank', 'noopener,noreferrer');
        return;
    }

    let tenBaiSach = String(tenBaiHoc || '').replace(/\s+/g, ' ').trim();
    thongTinBaiHocHienTai = {
        khoi: tenKhoiChuan,
        mon: tenMonGoc,
        bai: tenBaiSach,
        idKy1: trichXuatIdTuLink(duLieuMonHoc.linkKy1 || '') || '',
        idKy2: trichXuatIdTuLink(duLieuMonHoc.linkKy2 || '') || '',
        kyDangXem: kyHocPhanDong
    };
    idTepHienTai = idPdf;
    ketQuaHighlightHienTai = null;

    await xoaBoNhoDemCu(idTepHienTai);
    hienThiModalXemTruoc(tenKhoiChuan, tenMonGoc, tenBaiSach || 'Xem trước SGK', kyHocPhanDong);
    await xuLyDocPDF(idTepHienTai, tenBaiSach);
};

window.chuyenKyHocThuCong = async function(kyMoi) {
    if (thongTinBaiHocHienTai.kyDangXem === kyMoi) return; 

    let idMoi = (kyMoi === 1) ? thongTinBaiHocHienTai.idKy1 : thongTinBaiHocHienTai.idKy2;
    if (!idMoi) {
        alert(`Tài liệu Tập ${kyMoi} của môn này chưa được cấu hình Link.`);
        return;
    }

    thongTinBaiHocHienTai.kyDangXem = kyMoi;
    idTepHienTai = idMoi;
    ketQuaHighlightHienTai = null;

    document.getElementById('btnChuyenKy1').className = (kyMoi === 1) ? "px-3 py-1 rounded-md text-xs font-extrabold transition bg-white text-blue-900 shadow" : "px-3 py-1 rounded-md text-xs font-bold transition text-blue-200 hover:text-white hover:bg-white/10";
    document.getElementById('btnChuyenKy2').className = (kyMoi === 2) ? "px-3 py-1 rounded-md text-xs font-extrabold transition bg-white text-blue-900 shadow" : "px-3 py-1 rounded-md text-xs font-bold transition text-blue-200 hover:text-white hover:bg-white/10";

    let nhanKyHoc = (kyMoi === 1) ? "[Tập 1 / Kỳ 1]" : "[Tập 2 / Kỳ 2]";
    document.getElementById('tieuDeMonSgk').innerText = `Khối ${thongTinBaiHocHienTai.khoi} - Môn ${thongTinBaiHocHienTai.mon} ${nhanKyHoc}`;

    await xoaBoNhoDemCu(idTepHienTai);
    hienThiKhoiChoTai(`Đang truy xuất dữ liệu sách Tập ${kyMoi}...`);
    await xuLyDocPDF(idTepHienTai, thongTinBaiHocHienTai.bai);
};

// =========================================================================
// KHỐI 4: GIAO DIỆN HTML (BỔ SUNG KHUNG BÔI VÀNG & NÚT IN TRANG)
// =========================================================================
function xayDungKhungGiaoDienXemTruoc() {
    const modalHTML = `
    <div id="modalXemTruocSGK" class="hidden fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[9999] flex items-center justify-center font-sans transition-opacity reactbits-fade-in">
        <div class="bg-white w-11/12 md:w-5/6 lg:w-3/4 h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 transform scale-95 transition-transform duration-300" id="khungNoiDungModal">
            
            <div class="bg-gradient-to-r from-blue-800 to-indigo-900 px-5 py-3 flex justify-between items-center shadow-md z-10 flex-none border-b border-indigo-700">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="bg-white/20 p-1.5 rounded-lg">
                        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    </div>
                    <div class="truncate">
                        <h3 id="tieuDeMonSgk" class="text-white font-extrabold text-lg leading-tight truncate">Đang tải...</h3>
                        <p id="tieuDeBaiSgk" class="text-blue-100 text-sm font-semibold truncate">Vui lòng chờ...</p>
                    </div>
                    
                    <div class="hidden sm:flex bg-blue-900/50 p-1 rounded-lg ml-2 border border-blue-700/50" id="congTacKyHoc">
                        <button id="btnChuyenKy1" onclick="chuyenKyHocThuCong(1)" class="px-3 py-1 rounded-md text-xs font-bold transition text-blue-200 hover:text-white hover:bg-white/10">Kỳ 1</button>
                        <button id="btnChuyenKy2" onclick="chuyenKyHocThuCong(2)" class="px-3 py-1 rounded-md text-xs font-bold transition text-blue-200 hover:text-white hover:bg-white/10">Kỳ 2</button>
                    </div>
                </div>
                
                <div class="flex items-center gap-2 flex-none">
                    <div id="cumNutTaiXuong" class="hidden flex items-center bg-white/10 p-1 rounded-lg mr-1 border border-white/20">
                        <button onclick="taiToanBoSGK()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded shadow transition text-sm flex items-center gap-1.5" title="Tải toàn bộ cuốn sách">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span class="hidden sm:inline">Tải SGK</span>
                        </button>
                    </div>

                    <button onclick="lamMoiBoNhoDemPdf()" class="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 rounded-md text-yellow-300 transition border border-yellow-500/30" title="Làm mới sách / Xóa Cache">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>

                    <div id="nhomCongCuCanvas" class="hidden items-center gap-1">
                        <div class="h-6 w-px bg-white/30 mx-1"></div>
                        <button onclick="inTrangPdfHienTai()" class="bg-sky-500 hover:bg-sky-600 text-white font-bold py-1 px-2.5 rounded shadow transition text-sm flex items-center gap-1.5 mr-1" title="In hoặc lưu PDF trang đang hiển thị">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            <span class="hidden sm:inline">In trang</span>
                        </button>
                        <button onclick="dieuChinhThuPhong(0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition" title="Phóng to"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg></button>
                        <button onclick="dieuChinhThuPhong(-0.2)" class="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition mr-2" title="Thu nhỏ"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg></button>
                    </div>

                    <button onclick="dongModalXemTruoc()" class="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-sm transition ml-1" title="Đóng">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>

            <div class="flex-1 bg-slate-300 overflow-y-auto overflow-x-auto relative block text-center p-4 border-t border-slate-400" id="vungVeTaiLieu">
                
                <div id="bangDieuKhienTrang" class="hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-2xl flex-col items-center gap-2 z-20 border border-slate-600 min-w-[320px] transition-all">
                    <div class="flex items-center gap-4 w-full justify-center">
                        <button onclick="chuyenTrangPdf(-1)" class="hover:text-blue-400 font-extrabold px-3 transition text-xl">◀</button>
                        <div class="text-sm font-semibold tracking-wide flex items-center gap-1.5">
                            Trang 
                            <input type="number" id="nhapSoTrangNhanh" value="1" min="1" onchange="nhayDenTrangHoc(this.value)" class="w-14 text-center text-blue-900 font-extrabold rounded outline-none py-0.5 focus:ring-2 focus:ring-blue-400 bg-white shadow-inner">
                            / <span id="tongSoTrang">--</span>
                        </div>
                        <button onclick="chuyenTrangPdf(1)" class="hover:text-blue-400 font-extrabold px-3 transition text-xl">▶</button>
                    </div>
                    <input type="range" id="thanhTruotTrang" min="1" max="1" value="1" oninput="nhayDenTrangHoc(this.value)" class="w-full h-1.5 bg-slate-500 rounded-lg appearance-none cursor-pointer accent-blue-400 mt-1">
                </div>

                <div id="khoiTrangThaiSgk" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
                    <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p id="vanBanTrangThaiSgk" class="text-slate-700 font-bold text-lg">Đang kết nối thư viện...</p>
                </div>

                <div id="khungCanvasPdf" class="relative inline-block mx-auto mb-10 hidden">
                    <canvas id="canvasHienThiPdf" class="shadow-2xl bg-white block max-w-full h-auto"></canvas>
                    <div id="highlightBaiHocPdf" class="hidden absolute pointer-events-none rounded transition-all" style="background-color: rgba(250, 204, 21, 0.42); border: 2px solid #eab308;"></div>
                </div>
                
                <div id="vungIframeDuPhong" class="hidden absolute inset-0 z-[100] bg-[#131313]">
                    <div class="absolute top-0 right-4 w-[45px] h-[55px] bg-[#131313] z-[110] flex items-center justify-center cursor-not-allowed border-b border-l border-r border-slate-700/50" title="Tính năng mở tab mới bị khóa">
                        <svg class="w-5 h-5 text-gray-500 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <iframe id="iframeTaiLieuGoc" src="" class="w-full h-full border-0" allow="autoplay"></iframe>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function hienThiKhoiChoTai(vanBanThongBao) {
    document.getElementById('khoiTrangThaiSgk').classList.remove('hidden');
    document.getElementById('khungCanvasPdf').classList.add('hidden');
    document.getElementById('vungIframeDuPhong').classList.add('hidden');
    document.getElementById('nhomCongCuCanvas').classList.remove('flex');
    document.getElementById('nhomCongCuCanvas').classList.add('hidden');
    document.getElementById('bangDieuKhienTrang').classList.remove('flex');
    document.getElementById('bangDieuKhienTrang').classList.add('hidden');
    document.getElementById('iframeTaiLieuGoc').src = '';
    document.getElementById('vanBanTrangThaiSgk').innerText = vanBanThongBao;
}

function hienThiModalXemTruoc(tenKhoi, tenMon, tenBaiGoc, kyHoc) {
    let nhanKyHoc = (kyHoc === 2) ? "[Tập 2 / Kỳ 2]" : "[Tập 1 / Kỳ 1]";
    
    document.getElementById('tieuDeMonSgk').innerText = `Khối ${tenKhoi} - Môn ${tenMon} ${nhanKyHoc}`;
    document.getElementById('tieuDeBaiSgk').innerText = tenBaiGoc;
    
    document.getElementById('btnChuyenKy1').className = (kyHoc === 1) ? "px-3 py-1 rounded-md text-xs font-extrabold transition bg-white text-blue-900 shadow" : "px-3 py-1 rounded-md text-xs font-bold transition text-blue-200 hover:text-white hover:bg-white/10";
    document.getElementById('btnChuyenKy2').className = (kyHoc === 2) ? "px-3 py-1 rounded-md text-xs font-extrabold transition bg-white text-blue-900 shadow" : "px-3 py-1 rounded-md text-xs font-bold transition text-blue-200 hover:text-white hover:bg-white/10";
    
    hienThiKhoiChoTai("Đang kiểm tra ổ cứng tốc độ cao...");
    document.getElementById('cumNutTaiXuong').classList.add('hidden'); 

    const modal = document.getElementById('modalXemTruocSGK');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('khungNoiDungModal').classList.remove('scale-95');
        document.getElementById('khungNoiDungModal').classList.add('scale-100');
    }, 10);
}

function dongModalXemTruoc() {
    const modal = document.getElementById('modalXemTruocSGK');
    document.getElementById('khungNoiDungModal').classList.remove('scale-100');
    document.getElementById('khungNoiDungModal').classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

// =========================================================================
// KHỐI 5: ĐỘNG CƠ TẢI SIÊU TỐC (INDEXEDDB -> APPS SCRIPT -> ĐUA PROXY SONG SONG)
// =========================================================================
async function fetchVoiTimeout(url, thoiGianMax = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), thoiGianMax);
    try {
        const phanHoi = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return phanHoi;
    } catch (loi) {
        clearTimeout(timeoutId);
        throw loi;
    }
}

function giaiMaBase64SangArrayBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function kiemTraLaTepPdf(boDem) {
    if (!boDem || boDem.byteLength < 5) return false;
    const kiemTra = new Uint8Array(boDem.slice(0, 5));
    return kiemTra[0] === 37 && kiemTra[1] === 80 && kiemTra[2] === 68 && kiemTra[3] === 70 && kiemTra[4] === 45;
}

async function taiDuLieuPdfAnToan(idPdf) {
    let banGhiCache = await docTepTuBoNhoCucBo(idPdf);
    if (banGhiCache && !banGhiCache.loi && banGhiCache.duLieu) {
        document.getElementById('vanBanTrangThaiSgk').innerText = "Truy xuất tức thì từ ổ cứng (0ms)...";
        return banGhiCache.duLieu;
    }

    if (typeof CAU_HINH_FRONTEND !== 'undefined' && CAU_HINH_FRONTEND.URL_API_MAY_CHU) {
        try {
            document.getElementById('vanBanTrangThaiSgk').innerText = "Đang tải SGK siêu tốc từ máy chủ nhà trường...";
            const phanHoiGas = await fetchVoiTimeout(
                `${CAU_HINH_FRONTEND.URL_API_MAY_CHU}?thaoTac=taiPdfSGK&idPdf=${encodeURIComponent(idPdf)}`,
                45000
            );
            if (phanHoiGas.ok) {
                const duLieuGas = await phanHoiGas.json();
                if (duLieuGas && duLieuGas.trangThai === 'thanh_cong' && duLieuGas.base64) {
                    const boDemGas = giaiMaBase64SangArrayBuffer(duLieuGas.base64);
                    if (kiemTraLaTepPdf(boDemGas)) {
                        await luuTepVaoBoNhoCucBo(idPdf, boDemGas, false);
                        return boDemGas;
                    }
                }
            }
        } catch (loiGas) {
            console.warn("Apps Script chưa có endpoint taiPdfSGK hoặc quá tải, chuyển sang đua Proxy song song:", loiGas);
        }
    }

    document.getElementById('vanBanTrangThaiSgk').innerText = "Đang tải Sách nguyên bản qua luồng tăng tốc song song...";
    const dsProxy = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    const linkGoc = encodeURIComponent(`https://drive.google.com/uc?export=download&confirm=t&id=${idPdf}`);

    try {
        const boDemNhanhNhat = await Promise.any(
            dsProxy.map(async (proxy) => {
                const phanHoi = await fetchVoiTimeout(proxy + linkGoc, 8000);
                if (!phanHoi.ok) throw new Error("Proxy HTTP error");
                const boDem = await phanHoi.arrayBuffer();
                if (!kiemTraLaTepPdf(boDem)) throw new Error("Không phải dữ liệu PDF hợp lệ");
                return boDem;
            })
        );
        await luuTepVaoBoNhoCucBo(idPdf, boDemNhanhNhat, false);
        return boDemNhanhNhat;
    } catch (loiProxy) {
        console.warn("Tất cả Proxy đều thất bại / quá hạn:", loiProxy);
    }

    // Không lưu cờ lỗi vĩnh viễn để lần sau vẫn thử tải lại PDF
    throw new Error("Không tải được luồng byte PDF, tự động nhảy Iframe.");
}

async function xuLyDocPDF(idPdf, tenBaiCanTim = '') {
    // Đồng bộ phiên bản 3.11.174 với duyetgiaoan.js để giải mã font tiếng Việt chuẩn xác và không xung đột worker
    if (typeof pdfjsLib === 'undefined') {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    try {
        const duLieuPdf = await taiDuLieuPdfAnToan(idPdf);
        boNhoTrangPdfGiaiMa = {};
        
        const loadingTask = pdfjsLib.getDocument({ 
            data: duLieuPdf,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
            cMapPacked: true,
            disableStream: true,
            disableAutoFetch: true,
            disableRange: true
        });
        
        theHienPdfHienTai = await loadingTask.promise;
        
        document.getElementById('tongSoTrang').innerText = theHienPdfHienTai.numPages;
        document.getElementById('nhapSoTrangNhanh').max = theHienPdfHienTai.numPages;
        document.getElementById('thanhTruotTrang').max = theHienPdfHienTai.numPages;

        let trangDich = 1;
        ketQuaHighlightHienTai = null;

        if (tenBaiCanTim && String(tenBaiCanTim).trim() !== '') {
            document.getElementById('vanBanTrangThaiSgk').innerText = `Đang định vị chính xác bài: "${tenBaiCanTim}"...`;
            const ketQuaTim = await timTrangBaiHocThongMinh(theHienPdfHienTai, idPdf, tenBaiCanTim);
            trangDich = ketQuaTim.trang;
            ketQuaHighlightHienTai = ketQuaTim.highlight || null;
            if (ketQuaTim.laBanScan && ketQuaTim.trang === 1) {
                document.getElementById('tieuDeBaiSgk').innerText = `${tenBaiCanTim} (Sách ảnh scan - chưa tìm thấy mục lục tự động)`;
            }
        }
        trangHienTaiPDF = trangDich;

        document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
        document.getElementById('khungCanvasPdf').classList.remove('hidden');
        
        document.getElementById('nhomCongCuCanvas').classList.remove('hidden');
        document.getElementById('nhomCongCuCanvas').classList.add('flex');
        
        document.getElementById('bangDieuKhienTrang').classList.remove('hidden');
        document.getElementById('bangDieuKhienTrang').classList.add('flex');
        
        document.getElementById('cumNutTaiXuong').classList.remove('hidden');
        
        veTrangCanVasPdf(trangHienTaiPDF);

    } catch (loi) {
        console.warn("Chuyển Lưới an toàn Iframe:", loi);
        kichHoatLuoiAnToanIframe(idPdf);
    }
}

// =========================================================================
// BỘ PHÂN TÍCH TỌA ĐỘ DÒNG & SO KHỚP ĐA TẦNG (KẾ THỪA TỪ DUYETGIAOAN.JS)
// =========================================================================
function chuanHoaChuoiTimKiemSGK(str) {
    return String(str || '')
        .normalize('NFC')
        .toLowerCase()
        .replace(/[“”"'`’]/g, '')
        .replace(/[:;.,!?()\[\]\-–—\/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function boDauTiengVietSGK(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

function phanTichTenBaiSGK(tenBaiGoc) {
    let sachTiet = String(tenBaiGoc || '')
        .normalize('NFC')
        .replace(/(?:\s*[-–]\s*)?\(?\s*(?:tiết|t)\s*\d+(?:\s*[,\-&]\s*\d+)*\s*\)?\s*$/i, '')
        .trim();

    let maBai = '';
    let soBai = '';
    let tenPhu = '';
    let tenCotLoi = sachTiet;

    let matchTuan = sachTiet.match(/^((?:tuần|chủ\s*đề|chương)\s*(\d+))\s*[-–:]\s*([^:]+)\s*:\s*(.+)$/i);
    if (matchTuan) {
        maBai = chuanHoaChuoiTimKiemSGK(matchTuan[1]);
        soBai = matchTuan[2];
        tenPhu = chuanHoaChuoiTimKiemSGK(matchTuan[3]);
        tenCotLoi = chuanHoaChuoiTimKiemSGK(matchTuan[4]);
    } else {
        let matchBai = sachTiet.match(/^((?:bài|tuần|chủ\s*đề|chương|tiết)\s*(\d+[a-z]?))\s*[:\-–.]?\s*(.*)$/i);
        if (matchBai) {
            maBai = chuanHoaChuoiTimKiemSGK(matchBai[1]);
            soBai = matchBai[2].toLowerCase();
            tenCotLoi = chuanHoaChuoiTimKiemSGK(matchBai[3]);
        } else {
            tenCotLoi = chuanHoaChuoiTimKiemSGK(sachTiet);
        }
    }

    let cumDayDu = chuanHoaChuoiTimKiemSGK(`${maBai} ${tenCotLoi}`);
    let cumDayDuKD = boDauTiengVietSGK(cumDayDu);
    let tenCotLoiKD = boDauTiengVietSGK(tenCotLoi);
    let maBaiKD = boDauTiengVietSGK(maBai);
    let tuKhoa = tenCotLoi.split(' ').filter(w => w.length >= 2);
    let tuKhoaKD = tuKhoa.map(w => boDauTiengVietSGK(w));

    return { maBai, maBaiKD, soBai, tenPhu, tenCotLoi, tenCotLoiKD, cumDayDu, cumDayDuKD, tuKhoa, tuKhoaKD };
}

function trichXuatDongVanBanPdfSGK(textContent, pageViewport) {
    let items = (textContent && textContent.items) ? textContent.items : [];
    if (items.length === 0) return [];

    let mapped = [];
    for (let i = 0; i < items.length; i++) {
        let it = items[i];
        let str = String(it.str || '');
        if (!str) continue;
        let tx = pdfjsLib.Util.transform(pageViewport.transform, it.transform);
        let fontH = Math.hypot(tx[2], tx[3]) || Math.hypot(tx[0], tx[1]) || 12;
        let x = tx[4];
        let yBaseline = tx[5];
        let yTop = yBaseline - fontH;
        let w = (it.width || 0) * pageViewport.scale;
        mapped.push({ str: str, x: x, yTop: yTop, yBase: yBaseline, w: w, h: fontH });
    }

    // Sắp xếp chuẩn theo tọa độ trực quan từ trên xuống dưới, từ trái sang phải
    mapped.sort((a, b) => {
        if (Math.abs(a.yBase - b.yBase) > 5) return a.yBase - b.yBase;
        return a.x - b.x;
    });

    let lines = [];
    let curLine = null;
    for (let it of mapped) {
        if (!curLine || Math.abs(it.yBase - curLine.yBase) > Math.max(5, curLine.h * 0.45)) {
            curLine = { yBase: it.yBase, yTop: it.yTop, h: it.h, xMin: it.x, xMax: it.x + it.w, text: it.str };
            lines.push(curLine);
        } else {
            let gap = it.x - curLine.xMax;
            let needSpace = gap > Math.max(1.5, curLine.h * 0.18) && !curLine.text.endsWith(' ') && !it.str.startsWith(' ');
            curLine.text += (needSpace ? ' ' : '') + it.str;
            curLine.xMin = Math.min(curLine.xMin, it.x);
            curLine.xMax = Math.max(curLine.xMax, it.x + it.w);
            curLine.yTop = Math.min(curLine.yTop, it.yTop);
            curLine.h = Math.max(curLine.h, it.h);
        }
    }

    return lines.map(ln => {
        let chuan = chuanHoaChuoiTimKiemSGK(ln.text);
        return {
            raw: ln.text.trim(),
            chuan: chuan,
            kd: boDauTiengVietSGK(chuan),
            topPct: Math.max(0, (ln.yTop / pageViewport.height) * 100),
            heightPct: Math.max(1.5, ((ln.h * 1.4) / pageViewport.height) * 100),
            leftPct: Math.max(0, ((ln.xMin - 6) / pageViewport.width) * 100),
            widthPct: Math.min(100, (((ln.xMax - ln.xMin) + 12) / pageViewport.width) * 100)
        };
    }).filter(ln => ln.chuan.length > 0);
}

async function layDongTrangPDF(pdfDoc, idPdf, soTrang) {
    if (!boNhoChiMucPdf[idPdf]) boNhoChiMucPdf[idPdf] = {};
    if (boNhoChiMucPdf[idPdf][soTrang] !== undefined) {
        return boNhoChiMucPdf[idPdf][soTrang];
    }
    const page = await pdfDoc.getPage(soTrang);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.4 });
    const lines = trichXuatDongVanBanPdfSGK(textContent, viewport);
    boNhoChiMucPdf[idPdf][soTrang] = lines;
    return lines;
}

function escapeRegexSGK(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function khopTuNguyenVenSGK(textChuan, cumTu) {
    if (!textChuan || !cumTu) return false;
    let re = new RegExp('(?:^|\\s)' + escapeRegexSGK(cumTu.trim()) + '(?:$|\\s)');
    return re.test(textChuan);
}

// CHỈ ĐỌC PHẦN ĐẦU TRANG (28% phía trên cùng của trang PDF - nơi chứa dải tên Bài học)
function chamDiemDauTrangSGK(lines, soTrang, mucTieu) {
    if (!Array.isArray(lines) || lines.length === 0) return { diem: 0, highlight: null };

    // Lọc lấy duy nhất các dòng nằm ở 28% đầu trang
    const dongDauTrang = lines.filter(l => l.topPct <= 28);
    if (dongDauTrang.length === 0) return { diem: 0, highlight: null };

    // Bỏ qua trang Mục lục ở đầu sách
    let textCaTrang = lines.map(l => l.chuan).join(' ');
    let soDongBai = lines.filter(l => /^(bài|bai)\s+\d+/i.test(l.chuan)).length;
    if (soTrang <= 12 && (textCaTrang.includes('mục lục') || soDongBai >= 4)) {
        return { diem: 0, highlight: null };
    }

    let headerChuan = dongDauTrang.map(l => l.chuan).join(' ');
    let headerKD = dongDauTrang.map(l => l.kd).join(' ');

    let diem = 0;
    let khopMaBai = !!(mucTieu.maBaiKD && khopTuNguyenVenSGK(headerKD, mucTieu.maBaiKD));
    let khopTenBai = !!(
        (mucTieu.tenCotLoi && mucTieu.tenCotLoi.length >= 3 && khopTuNguyenVenSGK(headerChuan, mucTieu.tenCotLoi)) ||
        (mucTieu.tenCotLoiKD && mucTieu.tenCotLoiKD.length >= 3 && khopTuNguyenVenSGK(headerKD, mucTieu.tenCotLoiKD))
    );
    let khopSoBai = !!(mucTieu.soBai && khopTuNguyenVenSGK(headerKD, mucTieu.soBai));

    if (khopMaBai && khopTenBai) {
        diem = 200; // Khớp tuyệt đối cả "Bài XX" và "Tên bài" ở đầu trang
    } else if (khopSoBai && khopTenBai) {
        diem = 180; // Khớp số bài (trong ngôi sao/vòng tròn) + Tên bài ở đầu trang
    } else if (khopTenBai) {
        diem = 120; // Khớp chính xác nguyên tên bài ở đầu trang
    } else if (khopMaBai) {
        diem = 100; // Khớp đúng "Bài XX" ở đầu trang (phòng trường hợp tên vần được vẽ bằng ảnh vector)
    } else if (mucTieu.tuKhoaKD.length >= 2) {
        let soTuKhop = mucTieu.tuKhoaKD.filter(tu => khopTuNguyenVenSGK(headerKD, tu)).length;
        let tyLe = soTuKhop / mucTieu.tuKhoaKD.length;
        if (tyLe >= 0.75) {
            diem = Math.round(tyLe * 80);
        }
    }

    if (diem <= 0) return { diem: 0, highlight: null };

    // Tính khung bôi vàng bao trọn vùng tiêu đề ở đầu trang
    let boxTop = Math.min(...dongDauTrang.map(l => l.topPct));
    let boxBottom = Math.max(...dongDauTrang.map(l => l.topPct + l.heightPct));
    let boxLeft = Math.min(...dongDauTrang.map(l => l.leftPct));
    let boxRight = Math.max(...dongDauTrang.map(l => l.leftPct + l.widthPct));

    return {
        diem: diem,
        highlight: {
            trang: soTrang,
            topPct: boxTop,
            leftPct: boxLeft,
            widthPct: Math.min(100 - boxLeft, boxRight - boxLeft),
            heightPct: Math.max(2, boxBottom - boxTop)
        }
    };
}

async function quetLoDauTrangPDF(pdfDoc, idPdf, tuTrang, denTrang, mucTieu, kichThuocLo = 16, nguongDungSom = 180) {
    let trangTotNhat = 1;
    let diemMax = 0;
    let highlightTotNhat = null;

    for (let batDau = tuTrang; batDau <= denTrang; batDau += kichThuocLo) {
        let ketThuc = Math.min(denTrang, batDau + kichThuocLo - 1);
        let dsSoTrang = [];
        for (let p = batDau; p <= ketThuc; p++) dsSoTrang.push(p);

        let dsLines = await Promise.all(dsSoTrang.map(p => layDongTrangPDF(pdfDoc, idPdf, p)));
        for (let i = 0; i < dsSoTrang.length; i++) {
            let kq = chamDiemDauTrangSGK(dsLines[i], dsSoTrang[i], mucTieu);
            if (kq.diem > diemMax) {
                diemMax = kq.diem;
                trangTotNhat = dsSoTrang[i];
                highlightTotNhat = kq.highlight;
            }
        }
        if (diemMax >= nguongDungSom) break;
    }
    return { trangTotNhat, diemMax, highlightTotNhat };
}

// =========================================================================
// BỘ MÁY ĐỌC MỤC LỤC 2 CỘT + OCR ĐẦU TRANG CHO SÁCH ẢNH SCAN (CACHE INDEXEDDB)
// =========================================================================
async function napThuVienOCR() {
    if (typeof Tesseract !== 'undefined') return true;
    try {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return typeof Tesseract !== 'undefined';
    } catch (e) {
        console.warn("Không nạp được thư viện OCR:", e);
        return false;
    }
}

async function renderTrangPdfSangCanvas(pdfDoc, soTrang, scale = 1.6) {
    const page = await pdfDoc.getPage(soTrang);
    const viewport = page.getViewport({ scale: scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    return canvas;
}

function catVungCanvas(canvasGoc, xPct, yPct, wPct, hPct) {
    const c = document.createElement('canvas');
    const sx = Math.floor(canvasGoc.width * xPct);
    const sy = Math.floor(canvasGoc.height * yPct);
    const sw = Math.floor(canvasGoc.width * wPct);
    const sh = Math.floor(canvasGoc.height * hPct);
    c.width = Math.max(1, sw);
    c.height = Math.max(1, sh);
    const ctx = c.getContext('2d');
    ctx.drawImage(canvasGoc, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c;
}

function trichXuatSoTrangTuDongMucLuc(vanBanMucLuc, mucTieu) {
    const dongList = String(vanBanMucLuc || '').split(/\r?\n/);
    let ungVienTotNhat = null;
    let diemMax = 0;
    let danhSachMocBai = [];

    for (let i = 0; i < dongList.length; i++) {
        let dongGoc = dongList[i].trim();
        if (!dongGoc) continue;
        let dongChuan = chuanHoaChuoiTimKiemSGK(dongGoc);
        let dongKD = boDauTiengVietSGK(dongChuan);

        let matchSo = dongGoc.match(/(\d{1,3})[^\d\w]{0,4}$/);
        if (!matchSo && i + 1 < dongList.length) {
            matchSo = dongList[i + 1].trim().match(/^(\d{1,3})[^\d\w]{0,4}$/);
        }
        let soTrangIn = matchSo ? parseInt(matchSo[1], 10) : null;
        if (soTrangIn !== null && (soTrangIn < 1 || soTrangIn > 300)) soTrangIn = null;

        if (soTrangIn !== null) {
            let mMoc = dongKD.match(/^(?:bai|b)\s*(\d{1,3})\b/);
            if (mMoc) {
                let bSo = parseInt(mMoc[1], 10);
                if (bSo >= 1 && bSo <= 200) danhSachMocBai.push({ bai: bSo, trang: soTrangIn });
            }
        }

        let diem = 0;
        if (mucTieu.cumDayDu && (khopTuNguyenVenSGK(dongChuan, mucTieu.cumDayDu) || khopTuNguyenVenSGK(dongKD, mucTieu.cumDayDuKD))) {
            diem = 120;
        } else if (mucTieu.maBaiKD && khopTuNguyenVenSGK(dongKD, mucTieu.maBaiKD) && mucTieu.tenCotLoiKD && khopTuNguyenVenSGK(dongKD, mucTieu.tenCotLoiKD)) {
            diem = 110;
        } else if (mucTieu.soBai && new RegExp(`(?:^|\\s)(?:bai|b)\\s*${escapeRegexSGK(mucTieu.soBai)}(?:$|\\s)`).test(dongKD)) {
            diem = 90;
        } else if (mucTieu.tenCotLoi && mucTieu.tenCotLoi.length >= 4 && (khopTuNguyenVenSGK(dongChuan, mucTieu.tenCotLoi) || khopTuNguyenVenSGK(dongKD, mucTieu.tenCotLoiKD))) {
            diem = 80;
        } else if (mucTieu.maBaiKD && khopTuNguyenVenSGK(dongKD, mucTieu.maBaiKD)) {
            diem = 70;
        }

        if (diem > 0 && soTrangIn !== null && diem > diemMax) {
            diemMax = diem;
            ungVienTotNhat = soTrangIn;
        }
    }

    if (ungVienTotNhat !== null) return ungVienTotNhat;

    let soBaiTarget = mucTieu.soBai ? parseInt(mucTieu.soBai, 10) : NaN;
    if (!isNaN(soBaiTarget) && danhSachMocBai.length >= 2) {
        danhSachMocBai.sort((a, b) => a.bai - b.bai);
        let truoc = null, sau = null;
        for (let m of danhSachMocBai) {
            if (m.bai <= soBaiTarget) truoc = m;
            if (m.bai >= soBaiTarget && !sau) sau = m;
        }
        if (truoc && sau && truoc.bai !== sau.bai) {
            let tyLe = (soBaiTarget - truoc.bai) / (sau.bai - truoc.bai);
            return Math.round(truoc.trang + tyLe * (sau.trang - truoc.trang));
        } else if (truoc) {
            return truoc.trang + (soBaiTarget - truoc.bai) * 2;
        } else if (sau) {
            return Math.max(1, sau.trang - (sau.bai - soBaiTarget) * 2);
        }
    }
    return null;
}

function tachSoBaiTuHeaderOCR(rawText) {
    let txt = boDauTiengVietSGK(chuanHoaChuoiTimKiemSGK(rawText));
    let m = txt.match(/\bbai\s*(\d{1,3})\b/);
    if (m) return parseInt(m[1], 10);
    // Nếu chữ "BÀI" bị ngôi sao/nền màu che, bắt số đứng độc lập (1..150) ở dải đầu trang
    let mSo = txt.match(/\b(\d{1,3})\b/);
    if (mSo) {
        let val = parseInt(mSo[1], 10);
        if (val >= 1 && val <= 150) return val;
    }
    return null;
}

async function timNhiPhanDauTrangBangOCR(pdfDoc, worker, mucTieu) {
    const tongTrang = pdfDoc.numPages;
    let soBaiMucTieu = mucTieu.soBai ? parseInt(mucTieu.soBai, 10) : NaN;
    if (isNaN(soBaiMucTieu)) return 1;

    let left = 2;
    let right = tongTrang;
    let trangKiemTra = Math.floor((left + right) / 2);
    let bestTrang = 1;
    let minDiff = Infinity;
    const daKiemTra = new Set();

    for (let buoc = 0; buoc < 12 && left <= right; buoc++) {
        let timDuocSo = null;
        let trangDocDuoc = trangKiemTra;

        for (let offset of [0, -1, 1, -2, 2]) {
            let p = trangKiemTra + offset;
            if (p < left || p > right || daKiemTra.has(p)) continue;
            daKiemTra.add(p);

            const canvasFull = await renderTrangPdfSangCanvas(pdfDoc, p, 1.6);
            const canvasDai = catVungCanvas(canvasFull, 0, 0, 1, 0.22);
            const { data } = await worker.recognize(canvasDai);
            let raw = (data && data.text) ? data.text : '';
            let cleanKD = boDauTiengVietSGK(chuanHoaChuoiTimKiemSGK(raw));

            if ((mucTieu.tenCotLoiKD && mucTieu.tenCotLoiKD.length >= 4 && khopTuNguyenVenSGK(cleanKD, mucTieu.tenCotLoiKD)) ||
                (mucTieu.maBaiKD && khopTuNguyenVenSGK(cleanKD, mucTieu.maBaiKD))) {
                return p;
            }

            let soDocDuoc = tachSoBaiTuHeaderOCR(raw);
            if (soDocDuoc !== null) {
                timDuocSo = soDocDuoc;
                trangDocDuoc = p;
                let diff = Math.abs(soDocDuoc - soBaiMucTieu);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestTrang = p;
                }
                break;
            }
        }

        if (timDuocSo === soBaiMucTieu) {
            return trangDocDuoc;
        }

        if (timDuocSo !== null) {
            if (timDuocSo < soBaiMucTieu) {
                left = Math.max(left, trangDocDuoc + 1);
            } else {
                right = Math.min(right, trangDocDuoc - 1);
            }
            // Nhảy nội suy trực tiếp theo khoảng cách số bài (mỗi bài ~2 trang)
            let duDoan = trangDocDuoc + (soBaiMucTieu - timDuocSo) * 2;
            if (duDoan < left || duDoan > right) {
                duDoan = Math.floor((left + right) / 2);
            }
            trangKiemTra = duDoan;
        } else {
            // Nếu vùng này không đọc được số bài, thử chia đôi khoảng còn lại
            let mid = Math.floor((left + right) / 2);
            if (mid === trangKiemTra) break;
            trangKiemTra = mid;
        }
    }
    return bestTrang;
}

async function timTrangTrongSachScanBangOCR(pdfDoc, idPdf, mucTieu) {
    const tongTrang = pdfDoc.numPages;

    // 1. Kiểm tra Mục lục đã lưu trong IndexedDB chưa (0ms)
    let dsMucLuc = await docMucLucScanTuDB(idPdf);
    if (Array.isArray(dsMucLuc) && dsMucLuc.length > 0) {
        let gopMucLuc = dsMucLuc.map(m => m.text).join('\n');
        let trangIn = trichXuatSoTrangTuDongMucLuc(gopMucLuc, mucTieu);
        if (trangIn) {
            return Math.min(tongTrang, trangIn + 2);
        }
    }

    // 2. Nạp Tesseract.js và đọc Mục lục (tách riêng nửa trái / nửa phải cho bảng 2 cột như SGK Tiếng Việt 1)
    const daNapOcr = await napThuVienOCR();
    if (!daNapOcr) return 1;

    document.getElementById('vanBanTrangThaiSgk').innerText = "Sách ảnh scan: Đang đọc Mục lục bằng OCR (chỉ làm 1 lần)...";
    const worker = await Tesseract.createWorker('vie');

    try {
        if (!Array.isArray(dsMucLuc) || dsMucLuc.length === 0) {
            dsMucLuc = [];
            const maxTrangMucLuc = Math.min(10, tongTrang);
            let daThayMucLuc = false;

            for (let p = 2; p <= maxTrangMucLuc; p++) {
                const canvasFull = await renderTrangPdfSangCanvas(pdfDoc, p, 1.8);
                // Tách nửa trái và nửa phải để đọc chính xác bảng Mục lục 2 cột
                const canvasTrai = catVungCanvas(canvasFull, 0, 0, 0.52, 1);
                const canvasPhai = catVungCanvas(canvasFull, 0.48, 0, 0.52, 1);

                const resTrai = await worker.recognize(canvasTrai);
                const resPhai = await worker.recognize(canvasPhai);
                const txtGop = ((resTrai.data && resTrai.data.text) || '') + '\n' + ((resPhai.data && resPhai.data.text) || '');

                dsMucLuc.push({ page: p, text: txtGop });

                let low = boDauTiengVietSGK(txtGop.toLowerCase());
                let laTrangML = low.includes('muc luc') || (low.match(/\bbai\s*\d+/g) || []).length >= 3;
                if (laTrangML) {
                    daThayMucLuc = true;
                } else if (daThayMucLuc) {
                    // Đã qua hết các trang Mục lục liên tiếp -> dừng đọc Mục lục
                    break;
                }
            }

            if (dsMucLuc.length > 0) {
                await luuMucLucScanVaoDB(idPdf, dsMucLuc);
            }

            let gopMucLucMoi = dsMucLuc.map(m => m.text).join('\n');
            let trangIn = trichXuatSoTrangTuDongMucLuc(gopMucLucMoi, mucTieu);
            if (trangIn) {
                await worker.terminate();
                return Math.min(tongTrang, trangIn + 2);
            }
        }

        // 3. Nếu Mục lục không khớp được -> dò nhị phân dải đầu trang
        document.getElementById('vanBanTrangThaiSgk').innerText = `Đang dò nhanh đầu trang tìm ${mucTieu.maBai || 'bài học'}...`;
        const trangNhiPhan = await timNhiPhanDauTrangBangOCR(pdfDoc, worker, mucTieu);
        await worker.terminate();
        return trangNhiPhan;
    } catch (eOcr) {
        console.warn("Lỗi OCR:", eOcr);
        try { await worker.terminate(); } catch (eTerm) {}
        return 1;
    }
}

async function timTrangBaiHocThongMinh(pdfDoc, idPdf, tenBaiGoc) {
    const tongTrang = pdfDoc.numPages;
    const mucTieu = phanTichTenBaiSGK(tenBaiGoc);
    if (!mucTieu.cumDayDu && !mucTieu.tenCotLoi && !mucTieu.maBai) {
        return { trang: 1, laBanScan: false, highlight: null };
    }

    // Lấy mẫu 6 trang rải đều toàn sách
    const trangMau = Array.from(new Set([
        1,
        Math.max(1, Math.floor(tongTrang * 0.15)),
        Math.max(1, Math.floor(tongTrang * 0.35)),
        Math.max(1, Math.floor(tongTrang * 0.55)),
        Math.max(1, Math.floor(tongTrang * 0.75)),
        Math.max(1, tongTrang - 2)
    ]));
    const linesMau = await Promise.all(trangMau.map(p => layDongTrangPDF(pdfDoc, idPdf, p)));
    const tongKyTuMau = linesMau.reduce((s, arr) => s + arr.reduce((a, l) => a + l.chuan.length, 0), 0);

    if (tongKyTuMau >= 30) {
        // Sách có lớp chữ -> CHỈ QUÉT 28% ĐẦU MỖI TRANG
        const kq = await quetLoDauTrangPDF(pdfDoc, idPdf, 1, tongTrang, mucTieu, 16, 180);
        if (kq.diemMax >= 60) {
            return {
                trang: kq.trangTotNhat,
                laBanScan: false,
                highlight: kq.highlightTotNhat
            };
        }
    }

    // Sách ảnh scan -> đọc Mục lục 2 cột bằng OCR (cache IndexedDB) + dò đầu trang
    const trangOcr = await timTrangTrongSachScanBangOCR(pdfDoc, idPdf, mucTieu);
    return { trang: trangOcr, laBanScan: tongKyTuMau < 30, highlight: null };
}

async function veTrangCanVasPdf(soTrang) {
    if (!theHienPdfHienTai) return;
    
    document.getElementById('nhapSoTrangNhanh').value = soTrang;
    document.getElementById('thanhTruotTrang').value = soTrang;
    
    let trang = boNhoTrangPdfGiaiMa[soTrang];
    if (!trang) {
        trang = await theHienPdfHienTai.getPage(soTrang);
        boNhoTrangPdfGiaiMa[soTrang] = trang;
    }
    
    const canvas = document.getElementById('canvasHienThiPdf');
    const ctx = canvas.getContext('2d');
    
    const viewport = trang.getViewport({ scale: heSoThuPhong });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: ctx, viewport: viewport };
    await trang.render(renderContext).promise;

    // Hiển thị khung bôi vàng đúng dòng bài học nếu đang ở đúng trang tìm thấy
    const hlEl = document.getElementById('highlightBaiHocPdf');
    if (hlEl) {
        if (ketQuaHighlightHienTai && ketQuaHighlightHienTai.trang === soTrang) {
            hlEl.style.top = ketQuaHighlightHienTai.topPct.toFixed(2) + '%';
            hlEl.style.left = ketQuaHighlightHienTai.leftPct.toFixed(2) + '%';
            hlEl.style.width = ketQuaHighlightHienTai.widthPct.toFixed(2) + '%';
            hlEl.style.height = ketQuaHighlightHienTai.heightPct.toFixed(2) + '%';
            hlEl.classList.remove('hidden');

            // Cuộn vùng xem tới đúng vị trí dòng bôi vàng
            const vungCuon = document.getElementById('vungVeTaiLieu');
            if (vungCuon) {
                requestAnimationFrame(() => {
                    let yCuon = Math.max(0, (ketQuaHighlightHienTai.topPct / 100) * canvas.clientHeight - 80);
                    vungCuon.scrollTo({ top: yCuon, behavior: 'smooth' });
                });
            }
        } else {
            hlEl.classList.add('hidden');
        }
    }
}

async function inTrangPdfHienTai() {
    if (!theHienPdfHienTai) return;

    try {
        let trang = boNhoTrangPdfGiaiMa[trangHienTaiPDF];
        if (!trang) {
            trang = await theHienPdfHienTai.getPage(trangHienTaiPDF);
            boNhoTrangPdfGiaiMa[trangHienTaiPDF] = trang;
        }

        const viewportIn = trang.getViewport({ scale: 2.0 });
        const canvasTam = document.createElement('canvas');
        canvasTam.width = viewportIn.width;
        canvasTam.height = viewportIn.height;
        const ctxTam = canvasTam.getContext('2d');

        await trang.render({ canvasContext: ctxTam, viewport: viewportIn }).promise;
        const imgDataUrl = canvasTam.toDataURL('image/png');

        let iframeIn = document.getElementById('iframeInTrangSGK');
        if (!iframeIn) {
            iframeIn = document.createElement('iframe');
            iframeIn.id = 'iframeInTrangSGK';
            iframeIn.style.position = 'fixed';
            iframeIn.style.right = '0';
            iframeIn.style.bottom = '0';
            iframeIn.style.width = '0';
            iframeIn.style.height = '0';
            iframeIn.style.border = '0';
            document.body.appendChild(iframeIn);
        }

        const tieuDeIn = `${thongTinBaiHocHienTai.mon || 'SGK'} - Trang ${trangHienTaiPDF}`;
        const docIn = iframeIn.contentWindow.document;
        docIn.open();
        docIn.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${tieuDeIn}</title>
    <style>
        @page { size: auto; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff; display: flex; justify-content: center; align-items: center; height: 100%; }
        img { max-width: 100%; max-height: 100vh; object-fit: contain; display: block; }
    </style>
</head>
<body>
    <img src="${imgDataUrl}" onload="window.focus(); window.print();" />
</body>
</html>`);
        docIn.close();
    } catch (loi) {
        alert("Không thể tạo bản in trang PDF: " + loi.message);
    }
}

function chuyenTrangPdf(buocNhay) {
    if (!theHienPdfHienTai) return;
    let trangMoi = trangHienTaiPDF + buocNhay;
    if (trangMoi >= 1 && trangMoi <= theHienPdfHienTai.numPages) {
        trangHienTaiPDF = trangMoi;
        veTrangCanVasPdf(trangHienTaiPDF);
    }
}

function nhayDenTrangHoc(giaTriTrang) {
    if (!theHienPdfHienTai) return;
    let trangMoi = parseInt(giaTriTrang, 10);
    if (isNaN(trangMoi)) return;
    if (trangMoi < 1) trangMoi = 1;
    if (trangMoi > theHienPdfHienTai.numPages) trangMoi = theHienPdfHienTai.numPages;
    
    trangHienTaiPDF = trangMoi;
    veTrangCanVasPdf(trangHienTaiPDF);
}

function dieuChinhThuPhong(heSoThuThayDoi) {
    if (!theHienPdfHienTai) return;
    heSoThuPhong += heSoThuThayDoi;
    if (heSoThuPhong < 0.6) heSoThuPhong = 0.6;
    if (heSoThuPhong > 3.0) heSoThuPhong = 3.0;
    veTrangCanVasPdf(trangHienTaiPDF);
}

function kichHoatLuoiAnToanIframe(idPdf) {
    document.getElementById('khoiTrangThaiSgk').classList.add('hidden');
    document.getElementById('khungCanvasPdf').classList.add('hidden');
    
    document.getElementById('nhomCongCuCanvas').classList.remove('flex');
    document.getElementById('nhomCongCuCanvas').classList.add('hidden');
    
    document.getElementById('bangDieuKhienTrang').classList.remove('flex');
    document.getElementById('bangDieuKhienTrang').classList.add('hidden');
    
    const vungIframe = document.getElementById('vungIframeDuPhong');
    vungIframe.classList.remove('hidden');
    document.getElementById('iframeTaiLieuGoc').src = `https://drive.google.com/file/d/${idPdf}/preview`;

    document.getElementById('cumNutTaiXuong').classList.remove('hidden');
}

function taiToanBoSGK() {
    if (!idTepHienTai) {
        alert("Sự cố: Không định vị được ID của tài liệu Sách giáo khoa.");
        return;
    }
    window.open(`https://drive.google.com/uc?export=download&id=${idTepHienTai}`, '_blank');
}
