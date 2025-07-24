document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
    e.preventDefault()

    const cover = document.querySelector(".black-bg-cover").classList.add("active")
    const href = this.getAttribute('href')

    setTimeout(() => {
        window.location.href = href
    }, 400)
    })
})