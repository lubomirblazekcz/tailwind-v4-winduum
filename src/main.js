import { animationsFinished, nextRepaint } from './common.js'

export const computePopover = async (element, popover, options) => {
    const { computePosition, flip, shift, offset } = await import('@floating-ui/dom')

    await computePosition(element, popover, {
        placement: options?.placement,
        middleware: [offset(options?.offset), flip(), shift({ padding: 8 })]
    }).then(({ x, y, placement }) => {
        Object.assign(popover.style, {
            inset: `${y}px auto auto ${x}px`
        })

        popover._placement = placement
    })
}

document.querySelector('[data-action="popover#show"]').addEventListener('click', async (e) => {
    e.preventDefault()

    const currentTarget = e.currentTarget
    const { autoUpdate } = await import('@floating-ui/dom')

    const popoverTarget = window[currentTarget.getAttribute('popovertarget')]

    if (currentTarget.ariaExpanded === 'true') {
        popoverTarget.classList.remove('in')
        await animationsFinished(popoverTarget)
        popoverTarget._cleanup()
        popoverTarget.hidePopover && popoverTarget.hidePopover()
        currentTarget.ariaExpanded = false
        return
    }

    await computePopover(currentTarget, popoverTarget)

    currentTarget.ariaExpanded = true
    popoverTarget.showPopover && popoverTarget.showPopover()
    await nextRepaint()
    popoverTarget.classList.add('in')

    popoverTarget._cleanup = autoUpdate(
        currentTarget,
        popoverTarget,
        async () => await computePopover(currentTarget, popoverTarget)
    )
})
