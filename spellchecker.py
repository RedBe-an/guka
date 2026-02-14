import os
import re
import time
import glob
import logging
import difflib
from datetime import datetime

import requests

TEXTS_DIR = os.path.join(os.path.dirname(__file__), "public", "kice", "texts")
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
CHUNK_SIZE = 480
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

os.makedirs(LOG_DIR, exist_ok=True)

log_filename = os.path.join(
    LOG_DIR, f"spellcheck_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
)

logger = logging.getLogger("spellchecker")
logger.setLevel(logging.DEBUG)

# 콘솔 핸들러 (INFO 이상)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))

# 파일 핸들러 (DEBUG 이상, 상세 로그)
file_handler = logging.FileHandler(log_filename, encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(
    logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", datefmt="%H:%M:%S")
)

logger.addHandler(console_handler)
logger.addHandler(file_handler)


def get_passport_key():
    """네이버 맞춤법 검사기 passportKey를 가져온다."""
    logger.debug("passportKey 요청 중...")
    r = requests.get(
        "https://search.naver.com/search.naver",
        params={"where": "nexearch", "query": "맞춤법 검사기"},
        headers=HEADERS,
    )
    keys = re.findall(r"passportKey=([a-zA-Z0-9]+)", r.text)
    if not keys:
        logger.error("passportKey를 가져올 수 없습니다.")
        raise RuntimeError("passportKey를 가져올 수 없습니다.")
    logger.debug(f"passportKey 획득: {keys[0][:10]}...")
    return keys[0]


def spell_check(text, passport_key):
    """네이버 맞춤법 검사기 API로 텍스트를 교정한다."""
    url = "https://m.search.naver.com/p/csearch/ocontent/util/SpellerProxy"
    params = {
        "passportKey": passport_key,
        "q": text,
        "color_blindness": 0,
    }
    r = requests.get(url, params=params, headers=HEADERS)
    data = r.json()
    result = data["message"]["result"]
    errata = result["errata_count"]
    corrected = result["notag_html"]
    if errata > 0:
        logger.debug(f"  교정 {errata}건: \"{text[:60]}...\" -> \"{corrected[:60]}...\"")
    return corrected


def split_into_chunks(text, max_len=CHUNK_SIZE):
    """텍스트를 문장 단위로 max_len 이하 청크로 나눈다."""
    paragraphs = text.split("\n")
    chunks = []

    for para in paragraphs:
        para = para.strip()
        if not para:
            chunks.append("")
            continue

        # 문장 부호 뒤에서 분리
        sentences = re.split(r"(?<=[.?!다까요])\s+", para)
        current = ""
        for s in sentences:
            if len(current) + len(s) + 1 > max_len:
                if current:
                    chunks.append(current)
                # 문장 자체가 max_len보다 긴 경우 강제 분할
                while len(s) > max_len:
                    chunks.append(s[:max_len])
                    s = s[max_len:]
                current = s
            else:
                current = f"{current} {s}".strip() if current else s
        if current:
            chunks.append(current)

    return chunks


def check_and_fix(text, passport_key):
    """전체 텍스트를 청크별로 교정하여 반환한다."""
    chunks = split_into_chunks(text)
    results = []

    for chunk in chunks:
        if not chunk:
            results.append("")
            continue

        try:
            corrected = spell_check(chunk, passport_key)
            results.append(corrected)
        except Exception as e:
            logger.warning(f"  교정 실패, 원본 유지: {e}")
            results.append(chunk)

        time.sleep(0.3)

    return "\n".join(results).strip() + "\n"


def log_diff(filename, original, corrected):
    """원본과 교정본의 차이를 로그에 기록한다."""
    orig_lines = original.strip().splitlines()
    corr_lines = corrected.strip().splitlines()
    diff = list(
        difflib.unified_diff(orig_lines, corr_lines, fromfile="원본", tofile="교정", lineterm="")
    )
    if diff:
        logger.info(f"  [{filename}] 변경 내역:")
        for line in diff:
            if line.startswith("-") and not line.startswith("---"):
                logger.info(f"    {line}")
            elif line.startswith("+") and not line.startswith("+++"):
                logger.info(f"    {line}")


def main():
    logger.info(f"로그 파일: {log_filename}")
    logger.info("passportKey를 가져오는 중...")
    passport_key = get_passport_key()
    logger.info(f"passportKey: {passport_key[:10]}...")

    txt_files = sorted(glob.glob(os.path.join(TEXTS_DIR, "*.txt")))
    total = len(txt_files)
    logger.info(f"총 {total}개의 텍스트 파일을 처리합니다.\n")

    changed_count = 0

    for i, filepath in enumerate(txt_files, 1):
        filename = os.path.basename(filepath)
        logger.info(f"[{i}/{total}] {filename} 처리 중...")

        with open(filepath, "r", encoding="utf-8") as f:
            original = f.read()

        if not original.strip():
            logger.info("  (빈 파일, 건너뜀)")
            continue

        corrected = check_and_fix(original, passport_key)

        if corrected.strip() != original.strip():
            log_diff(filename, original, corrected)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(corrected)
            changed_count += 1
            logger.info(f"  -> 수정 완료")
        else:
            logger.info(f"  -> 변경 없음")

        # passportKey가 만료될 수 있으므로 50개마다 갱신
        if i % 50 == 0:
            try:
                passport_key = get_passport_key()
                logger.info("  (passportKey 갱신됨)")
            except Exception:
                logger.warning("  passportKey 갱신 실패, 기존 키 유지")

    logger.info(f"\n완료! 총 {changed_count}/{total}개 파일이 수정되었습니다.")
    logger.info(f"상세 로그: {log_filename}")


if __name__ == "__main__":
    main()
