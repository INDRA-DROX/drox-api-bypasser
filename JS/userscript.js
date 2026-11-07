(async () => {
    const loadingText = document.getElementById('loading-text')
    const searchParams = new URLSearchParams(window.location.search);

    const url = searchParams.get('url')
    const parsedTimeout = searchParams.get('time') && !isNaN(parseInt(searchParams.get('time'))) ? parseInt(searchParams.get('time')) : 10;
    const timeout = parsedTimeout === 0 ? 1 : parsedTimeout;
    const apiKey = searchParams.get('key')

    if (apiKey && !localStorage.getItem('apiKey') && isValidApiKey(apiKey)) {
        localStorage.setItem('apiKey', apiKey);
    }

    if (!url) {
        loadingText.textContent = 'No URL provided'
        return
    }

    if (!isValidUrl(url)) {
        loadingText.textContent = 'Invalid URL provided'
        return
    }

    loadingText.textContent = `Waiting ${timeout} seconds before requesting the bypass...`

    let remainingSeconds = timeout;
    const loadingAnimation = setInterval(() => {
        remainingSeconds--;
        loadingText.textContent = `Waiting ${remainingSeconds} seconds before requesting the bypass...`;

    }, 1000);

    setTimeout(() => {
        clearInterval(loadingAnimation);
    }, timeout * 1000);

    await new Promise(resolve => setTimeout(resolve, timeout * 1000));

    let apiResponse;

    loadingText.textContent = 'Please wait while we are bypassing the link...'

    const apiRequestTimeout = setTimeout(() => {
        loadingText.textContent = "Sit tight! Your request is still being processed...";
    }, 15000);

    try {
        apiResponse = await apiRequest(url);
    } catch (e) {
        console.log(e);
        clearTimeout(apiRequestTimeout);
        return showPopup(e.message || 'Error contacting API, please try again later.');
    }

    clearTimeout(apiRequestTimeout);

    if (apiResponse.status == 'success') {
        if (isValidUrl(apiResponse.result)) {
            loadingText.textContent = 'Link bypassed successfully! Redirecting back to the original link with result...'
            const originalUrl = new URL(url);
            const separator = originalUrl.search ? '&' : '?';
            location.href = url + separator + 'redirect=' + encodeURIComponent(apiResponse.result);
        } else {
            loadingText.textContent = 'Link bypassed successfully! Opening result in popup...'
            showPopup(apiResponse.result)
        }
    } else if (apiResponse.status == 'error') {
        loadingText.textContent = apiResponse.message != null ? String(apiResponse.message) : ''
    } else {
        loadingText.textContent = 'An unknown error occurred'
    }
})();
