# 버림뚝딱 v1 Launch Acceptance Checklist

## 데이터
- [ ] Seed v1.1 로딩 성공
- [ ] 총 120개 품목 파싱
- [ ] verified 30개 정확히 인식
- [ ] needs_research 90개는 공개 배출방법 페이지 미생성
- [ ] id 중복 0
- [ ] slug 중복 0
- [ ] canonical 중복 0
- [ ] verified source 0개인 품목 없음
- [ ] broken related slug 0

## 검색
- [ ] 후라이팬 → 후라이팬
- [ ] 프라이팬 → 후라이팬
- [ ] 후라이펜 → 후라이팬
- [ ] 에어후라이기 → 에어프라이어 (미검증이면 준비중 처리)
- [ ] 전자렌지 → 전자레인지
- [ ] 티비 → TV
- [ ] 핸드폰 → 휴대폰 (미검증이면 준비중 처리)
- [ ] 검색결과 없음 → 안내 + D1 집계
- [ ] 1글자/공백/과도한 길이 입력 방어
- [ ] HTML/script 문자열 입력 시 실행되지 않음

## 페이지
- [ ] 모바일 360px 정상
- [ ] 768px 정상
- [ ] 데스크톱 정상
- [ ] 첫 화면에서 배출 정답 확인 가능
- [ ] 광고가 정답을 가리지 않음
- [ ] 출처 링크 정상
- [ ] checked/verified 날짜 표시
- [ ] 지역차이 문구 표시
- [ ] 관련 품목 링크 404 없음
- [ ] 외부 CTA 새 창 정책 일관성

## 폐가전
- [ ] 냉장고 단일수거 문구
- [ ] 세탁기 단일수거 문구
- [ ] 에어컨 철거 필요 안내
- [ ] TV 크기 조건 안내
- [ ] 소형가전 다량/전용수거함 조건
- [ ] 1599-0903 및 공식 사이트 링크 확인
- [ ] “무조건 무료” 같은 과장 표현 없음

## SEO
- [ ] 홈 canonical
- [ ] 품목 canonical
- [ ] 검색 noindex,follow
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] sitemap에 verified URL만
- [ ] sitemap에 검색 URL 없음
- [ ] WebSite schema
- [ ] Organization schema
- [ ] WebPage schema
- [ ] BreadcrumbList schema
- [ ] SearchAction 없음
- [ ] title/H1 중복/누락 검사
- [ ] OG title/description
- [ ] 404에 noindex
- [ ] www/non-www 하나로 통일

## 광고/정책
- [ ] 개인정보처리방침 링크 footer에 존재
- [ ] 정보 출처 정책 링크 존재
- [ ] 제휴 고지 페이지 존재
- [ ] 쿠팡 제휴 블록 근처 경제적 이해관계 표시
- [ ] AdSense privacy disclosure 반영
- [ ] EEA/UK/Switzerland 트래픽 대응 CMP 설정 검토
- [ ] ads.txt 필요 시 설정

## 성능
- [ ] Lighthouse Performance 90+ 목표
- [ ] Accessibility 90+ 목표
- [ ] SEO 95+ 목표
- [ ] 이미지 lazy loading
- [ ] 광고 영역 min-height 예약
- [ ] 폰트 과다 로딩 없음
- [ ] JS 번들 불필요하게 크지 않음
- [ ] 검색 index gzip/Brotli 효율 확인

## 보안
- [ ] API key 프런트 bundle에 없음
- [ ] GitHub 저장소에 secret 없음
- [ ] D1 입력 parameterized query
- [ ] missing-search 입력 길이 제한
- [ ] rate/debounce 적용
- [ ] CSP 적용 가능성 검토
- [ ] 외부 링크 rel 정책 확인

## 배포
- [ ] Cloudflare Preview 정상
- [ ] production 전 사용자 검토
- [ ] DNS 변경 전 확인
- [ ] Search Console 등록
- [ ] 네이버 서치어드바이저 등록
- [ ] sitemap 제출
- [ ] 대표 5개 URL 실제 HTML 검사
