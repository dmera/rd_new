(function(){
	// Theme mode management (system/light/dark)
	const themeMedia = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
	const getSystemTheme = () => (themeMedia && themeMedia.matches ? 'dark' : 'light');

	const applyTheme = (mode) => {
		const body = document.body;
		body.classList.remove('theme-dark', 'theme-light');
		if (mode === 'dark') {
			body.classList.add('theme-dark');
		} else if (mode === 'light') {
			body.classList.add('theme-light');
		} // 'system' means no explicit class

		// Swap brand logos to dark/light variants
		const isDark = mode === 'dark' || (mode === 'system' && getSystemTheme() === 'dark');
		const logos = document.querySelectorAll('.brand-logo');
		logos.forEach((img) => {
			const lightSrc = img.getAttribute('data-light-src');
			const darkSrc = img.getAttribute('data-dark-src');
			if (lightSrc && darkSrc) {
				img.setAttribute('src', isDark ? darkSrc : lightSrc);
			}
		});

		// Swap portfolio card images (default only; hover handled separately)
		const portfolioImgs = document.querySelectorAll('.card-media img[data-light-src][data-dark-src]');
		const isMobileTablet = window.matchMedia('(max-width: 1199px)').matches;
		portfolioImgs.forEach((img) => {
			const lightSrc = img.getAttribute('data-light-src');
			const darkSrc = img.getAttribute('data-dark-src');
			const hoverSrc = img.getAttribute('data-hover-src');
			
			// On mobile/tablet, use hover images by default
			if (isMobileTablet && hoverSrc) {
				img.setAttribute('src', hoverSrc);
			} else if (lightSrc && darkSrc) {
				img.setAttribute('src', isDark ? darkSrc : lightSrc);
			}
		});
	};

	const updateToggleUI = (mode) => {
		const toggles = document.querySelectorAll('.theme-toggle');
		const isMobileTablet = window.matchMedia('(max-width: 879.98px)').matches;
		toggles.forEach(btn => {
			btn.setAttribute('data-mode', mode);
			let iconClass;
			if (mode === 'dark') {
				iconClass = 'pi pi-moon';
			} else if (mode === 'light') {
				iconClass = 'pi pi-sun';
			} else {
				iconClass = isMobileTablet ? 'pi pi-mobile' : 'pi pi-desktop';
			}
			btn.innerHTML = `<span class="theme-toggle-label">theme</span><i class="${iconClass}" aria-hidden="true"></i>`;
			const tooltip = mode === 'dark' ? 'Dark mode' : (mode === 'light' ? 'Light mode' : 'Same as system');
			btn.removeAttribute('title');
			btn.setAttribute('aria-label', `Theme toggle: ${tooltip}`);
			btn.setAttribute('aria-pressed', mode !== 'system');
		});
	};

	const initTheme = () => {
		let saved = localStorage.getItem('theme');
		// Ensure default is 'system' if not set or invalid
		if (!saved || !['system', 'light', 'dark'].includes(saved)) {
			saved = 'system';
			localStorage.setItem('theme', 'system');
		}
		applyTheme(saved);
		updateToggleUI(saved);
		// React to system changes when in system mode
		if (themeMedia) {
			themeMedia.addEventListener('change', () => {
				const current = localStorage.getItem('theme') || 'system';
				if (current === 'system') {
					applyTheme('system');
					updateToggleUI('system');
				}
			});
		}
	};

	const cycleMode = (current) => {
		if (current === 'system') return 'dark';
		if (current === 'dark') return 'light';
		return 'system';
	};

	const bindThemeToggle = () => {
		const toggles = document.querySelectorAll('.theme-toggle');
		const desktopMq = window.matchMedia('(min-width: 880px)');
		toggles.forEach(btn => {
			btn.addEventListener('click', () => {
				const current = localStorage.getItem('theme') || 'system';
				const next = cycleMode(current);
				localStorage.setItem('theme', next);
				applyTheme(next);
				updateToggleUI(next);

				// Click animation (desktop only)
				if (desktopMq.matches) {
					try {
						const isHover = btn.matches(':hover');
						const keyframes = isHover
							? [
								{ transform: 'scale(1.05)' },
								{ transform: 'scale(1.00)' },
								{ transform: 'scale(1.05)' }
							]
							: [
								{ transform: 'scale(1.00)' },
								{ transform: 'scale(0.99)' },
								{ transform: 'scale(1.00)' }
							];
						btn.animate(keyframes, { duration: 180, easing: 'ease-out' });
					} catch (e) {
						// no-op if animations are unsupported
					}
				}
			});

			// Tooltip (desktop only - checked dynamically)
			let tooltipEl = null;
			let tooltipTimeout = null;
			const createAndPositionTooltip = () => {
				if (!desktopMq.matches) return; // Only on desktop
				const mode = btn.getAttribute('data-mode') || 'system';
				const text = mode === 'dark' ? 'Dark mode' : (mode === 'light' ? 'Light mode' : 'Same as system');
				if (!tooltipEl) {
					tooltipEl = document.createElement('div');
					tooltipEl.className = 'theme-tooltip';
					document.body.appendChild(tooltipEl);
				}
				tooltipEl.textContent = text;
				const rect = btn.getBoundingClientRect();
				const centerX = rect.left + (rect.width / 2);
				const topY = rect.top - 10;
				tooltipEl.style.left = centerX + 'px';
				tooltipEl.style.top = topY + 'px';
				tooltipEl.style.transform = 'translate(-50%, -100%)';
				tooltipEl.style.opacity = '1';
			};

			const scheduleTooltip = () => {
				if (!desktopMq.matches) return; // Only on desktop
				clearTimeout(tooltipTimeout);
				tooltipTimeout = setTimeout(createAndPositionTooltip, 150);
			};

			const hideTooltip = () => {
				if (!desktopMq.matches) return; // Only on desktop
				clearTimeout(tooltipTimeout);
				if (tooltipEl) {
					tooltipEl.style.opacity = '0';
				}
			};

			btn.addEventListener('mouseenter', scheduleTooltip);
			btn.addEventListener('mouseleave', hideTooltip);
		});
	};

	initTheme();
	bindThemeToggle();
	
	// Update icon when viewport size changes (mobile ↔ desktop)
	const resizeMq = window.matchMedia('(max-width: 879.98px)');
	resizeMq.addEventListener('change', () => {
		const current = localStorage.getItem('theme') || 'system';
		updateToggleUI(current);
	});
	const navToggleButton = document.querySelector('.nav-toggle');
	const navElement = document.getElementById('site-nav');
	if (navToggleButton && navElement) {
		navToggleButton.addEventListener('click', () => {
			const isExpanded = navToggleButton.getAttribute('aria-expanded') === 'true';
			navToggleButton.setAttribute('aria-expanded', String(!isExpanded));
			navElement.classList.toggle('open');
		});
	}
	// Function to close mobile menu
	const closeMobileMenu = () => {
		if (navElement && navElement.classList.contains('open')) {
			navElement.classList.remove('open');
			navToggleButton?.setAttribute('aria-expanded', 'false');
		}
	};

	// Close mobile nav on link click
	navElement?.addEventListener('click', (e) => {
		const target = e.target;
		if (target instanceof HTMLElement && target.tagName.toLowerCase() === 'a') {
			closeMobileMenu();
		}
	});

	// Close mobile menu on scroll
	window.addEventListener('scroll', () => {
		closeMobileMenu();
	});

	// Close mobile menu when clicking outside
	document.addEventListener('click', (e) => {
		const isClickInsideNav = navElement && (navElement.contains(e.target) || navToggleButton?.contains(e.target));
		if (!isClickInsideNav && navElement?.classList.contains('open')) {
			closeMobileMenu();
		}
	});

	// Highlight active navigation link
	const navLinks = document.querySelectorAll('.nav-list a');
	if (navLinks.length > 0) {
		const currentPathname = window.location.pathname.toLowerCase();
		const currentPage = currentPathname.split('/').pop() || '';
		
		navLinks.forEach(link => {
			const linkHref = link.getAttribute('href');
			if (linkHref) {
				const linkHrefLower = linkHref.toLowerCase();
				// Extract page name from href (e.g., "team.html" -> "team")
				const linkFileName = linkHrefLower.split('/').pop() || linkHrefLower;
				const linkPage = linkFileName.replace('.html', '');
				const currentPageNoExt = currentPage.replace('.html', '');
				
				// Check if current page matches
				if (currentPage === linkFileName || 
				    currentPageNoExt === linkPage ||
				    (linkPage === 'team' && currentPathname.includes('team')) ||
				    (linkPage === 'privacy' && currentPathname.includes('privacy')) ||
				    (linkPage === 'imprint' && currentPathname.includes('imprint')) ||
				    (linkPage === 'index' && (currentPage === '' || currentPage === 'index.html'))) {
					link.classList.add('active');
				}
			}
		});
	}

	// Highlight active footer link (same logic as header)
	const footerLinks = document.querySelectorAll('.footer-links a');
	if (footerLinks.length > 0) {
		const currentPathname = window.location.pathname.toLowerCase();
		const currentPage = currentPathname.split('/').pop() || '';
		
		footerLinks.forEach(link => {
			const linkHref = link.getAttribute('href');
			if (linkHref) {
				const linkHrefLower = linkHref.toLowerCase();
				// Extract page name from href (e.g., "team.html" -> "team")
				const linkFileName = linkHrefLower.split('/').pop() || linkHrefLower;
				const linkPage = linkFileName.replace('.html', '');
				const currentPageNoExt = currentPage.replace('.html', '');
				
				// Check if current page matches
				if (currentPage === linkFileName || 
				    currentPageNoExt === linkPage ||
				    (linkPage === 'team' && currentPathname.includes('team')) ||
				    (linkPage === 'privacy' && currentPathname.includes('privacy')) ||
				    (linkPage === 'imprint' && currentPathname.includes('imprint')) ||
				    (linkPage === 'index' && (currentPage === '' || currentPage === 'index.html'))) {
					link.classList.add('active');
				}
			}
		});
	}

	// Scroll down button functionality
	const scrollDownBtn = document.querySelector('.scroll-down-btn');
	if (scrollDownBtn) {
		scrollDownBtn.addEventListener('click', () => {
			const portfolioSection = document.getElementById('portfolio');
			if (portfolioSection) {
				portfolioSection.scrollIntoView({ behavior: 'smooth' });
			}
		});
	}

	// Header shadow on scroll
	const siteHeader = document.querySelector('.site-header');
	if (siteHeader) {
		window.addEventListener('scroll', () => {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			
			if (scrollTop > 0) {
				siteHeader.classList.add('scrolled');
			} else {
				siteHeader.classList.remove('scrolled');
			}
		});
		
		// Check initial scroll position
		const initialScrollTop = window.pageYOffset || document.documentElement.scrollTop;
		if (initialScrollTop > 0) {
			siteHeader.classList.add('scrolled');
		}
	}

	// Back to top button functionality
	const backToTopBtn = document.querySelector('.back-to-top');
	if (backToTopBtn) {
		// Show/hide button based on scroll position
		window.addEventListener('scroll', () => {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			const viewportHeight = window.innerHeight;
			
			if (scrollTop > viewportHeight) {
				backToTopBtn.classList.add('visible');
			} else {
				backToTopBtn.classList.remove('visible');
			}
		});

		// Scroll to top when clicked
		backToTopBtn.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// Card hover image functionality
	const cards = document.querySelectorAll('.card');
	const isMobileTablet = window.matchMedia('(max-width: 1199px)').matches;
	
	cards.forEach(card => {
		const img = card.querySelector('.card-media img');
		if (img) {
			const dataHover = img.getAttribute('data-hover-src');
			const dataLight = img.getAttribute('data-light-src');
			const dataDark = img.getAttribute('data-dark-src');
			
			const getOriginalSrc = () => {
				const currentMode = localStorage.getItem('theme') || 'system';
				const isDark = currentMode === 'dark' || (currentMode === 'system' && getSystemTheme() === 'dark');
				return (isDark && dataDark) ? dataDark : (dataLight || img.src);
			};
			
			const hoverSrc = dataHover || img.src.replace('.png', '-hover.png').replace('.jpg', '-hover.jpg').replace('.svg', '-hover.svg');
			
			// On mobile/tablet, use hover images by default
			if (isMobileTablet && hoverSrc) {
				img.src = hoverSrc;
			}
			
			// Only add hover listeners on desktop
			if (!isMobileTablet) {
				card.addEventListener('mouseenter', () => {
					img.src = hoverSrc;
				});
				
				card.addEventListener('mouseleave', () => {
					img.src = getOriginalSrc();
				});
			}
		}
	});
	
	// Update images on resize (in case user switches between mobile and desktop)
	let resizeTimeout;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			const isMobileTabletNow = window.matchMedia('(max-width: 1199px)').matches;
			const cardsNow = document.querySelectorAll('.card');
			cardsNow.forEach(card => {
				const img = card.querySelector('.card-media img');
				if (img) {
					const dataHover = img.getAttribute('data-hover-src');
					const dataLight = img.getAttribute('data-light-src');
					const dataDark = img.getAttribute('data-dark-src');
					
					if (isMobileTabletNow && dataHover) {
						img.src = dataHover;
					} else {
						const currentMode = localStorage.getItem('theme') || 'system';
						const isDark = currentMode === 'dark' || (currentMode === 'system' && getSystemTheme() === 'dark');
						img.src = (isDark && dataDark) ? dataDark : (dataLight || img.src);
					}
				}
			});
		}, 250);
	});

	// Reveal-on-scroll (slide-up) animation
	const revealElements = document.querySelectorAll('.reveal-up');
	if (revealElements.length > 0) {
		// Function to check if element is in viewport (with tolerance)
		const isInViewport = (el) => {
			const rect = el.getBoundingClientRect();
			const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
			const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
			
			// Check if element is visible (fully or partially) within viewport
			// Allow some tolerance for elements that are just above or below
			return (
				rect.top < viewportHeight + 300 && // 300px below viewport
				rect.bottom > -100 && // 100px above viewport
				rect.left < viewportWidth &&
				rect.right > 0
			);
		};

		// Function to trigger animation
		const triggerAnimation = (el) => {
			if (!el.classList.contains('is-visible')) {
				el.classList.remove('is-hidden');
				el.classList.add('is-visible');
			}
		};

		// Hide elements initially
		revealElements.forEach((el) => {
			el.classList.add('is-hidden');
		});
		
		// Separate cards from other elements
		const cards = document.querySelectorAll('.card.reveal-up');
		const teamMembers = document.querySelectorAll('.team-member.reveal-up');
		const otherElements = Array.from(revealElements).filter(el => !el.classList.contains('card') && !el.classList.contains('team-member'));
		
		// Observer for cards with earlier trigger
		const cardObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					triggerAnimation(entry.target);
					cardObserver.unobserve(entry.target);
				}
			});
		}, { 
			rootMargin: '300px 0px -100px 0px',
			threshold: 0.01 
		});

		// Observer for team members
		const teamObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					triggerAnimation(entry.target);
					teamObserver.unobserve(entry.target);
				}
			});
		}, { 
			rootMargin: '300px 0px -100px 0px',
			threshold: 0.01 
		});

		// Observer for other elements (title, subtitle, etc.)
		const otherObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					triggerAnimation(entry.target);
					otherObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.1 });

		// Check elements on page load and trigger animation if already visible
		const checkInitialViewport = () => {
			// Use requestAnimationFrame twice to ensure layout is complete
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTimeout(() => {
						Array.from(revealElements).forEach((el, index) => {
							if (isInViewport(el) && !el.classList.contains('is-visible')) {
								// Staggered delay for smooth sequential animation
								setTimeout(() => {
									triggerAnimation(el);
								}, 200 + (index * 30)); // 200ms initial delay + 30ms between each element
							}
						});
					}, 100); // Delay to ensure page is fully rendered
				});
			});
		};

		// Trigger animations for elements already in viewport on load
		const runOnLoad = () => {
			checkInitialViewport();
		};

		// Wait for page to be fully loaded
		if (document.readyState === 'loading') {
			window.addEventListener('load', runOnLoad);
			document.addEventListener('DOMContentLoaded', checkInitialViewport);
		} else if (document.readyState === 'interactive') {
			window.addEventListener('load', runOnLoad);
			checkInitialViewport();
		} else {
			// Document is already complete
			runOnLoad();
		}

		// Observe cards with early trigger (only if not already visible)
		cards.forEach((card) => {
			if (!card.classList.contains('is-visible')) {
				cardObserver.observe(card);
			}
		});

		// Observe team members (only if not already visible)
		teamMembers.forEach((member) => {
			if (!member.classList.contains('is-visible')) {
				teamObserver.observe(member);
			}
		});
		
		// Observe other elements with normal trigger (only if not already visible)
		otherElements.forEach((el) => {
			if (!el.classList.contains('is-visible')) {
				otherObserver.observe(el);
			}
		});
	}

	// Floating navigation active section highlighting
	const floatingNavLinks = document.querySelectorAll('.floating-nav-list a');
	if (floatingNavLinks.length > 0) {
		// Only get sections that have corresponding links in the navbar
		const sections = Array.from(floatingNavLinks).map(link => {
			const href = link.getAttribute('href');
			if (href && href.startsWith('#')) {
				return document.querySelector(href);
			}
			return null;
		}).filter(section => section !== null);
		
		const updateActiveNav = () => {
			const scrollPosition = window.scrollY + 150; // Offset for better UX
			let currentSection = null;
			
			// Find the current section based on scroll position
			for (let i = sections.length - 1; i >= 0; i--) {
				const section = sections[i];
				const sectionTop = section.offsetTop;
				
				if (scrollPosition >= sectionTop) {
					currentSection = section;
					break;
				}
			}
			
			// If we're at the very top, highlight the first section
			if (scrollPosition < sections[0]?.offsetTop - 100) {
				currentSection = sections[0];
			}
			
			// Remove active class from all links
			floatingNavLinks.forEach(link => link.classList.remove('active'));
			
			// Add active class to current section link
			if (currentSection) {
				const sectionId = currentSection.getAttribute('id');
				const activeLink = document.querySelector(`.floating-nav-list a[href="#${sectionId}"]`);
				if (activeLink) {
					activeLink.classList.add('active');
				}
			}
		};
		
		// Update on scroll
		window.addEventListener('scroll', updateActiveNav);
		
		// Update on page load
		updateActiveNav();
	}
})();


