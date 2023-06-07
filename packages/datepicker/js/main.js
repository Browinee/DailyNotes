(function () {
    const datepicker = window.datepicker;
    let monthData, $wrapper;
    datepicker.buildUi = function (year, month) {
        monthData = datepicker.getMonthData(year, month);
        const dateHtml = monthData.days.reduce((curr, next, idx) => {
            if (idx % 7 === 0) {
                curr += "<tr>"
            }
            curr += `<td data-date=${next.date}>${next.showDate}</td>`;
            if (idx % 7 === 6) {
                curr += "</tr>";
            }
            return curr;
        }, "");
        const html = `
             <div class="ui-datepicker-header">
                <a href="#" class="ui-datepicker-btn ui-datepicker-prev-btn">&lt;</a>
                <span class="ui-datepicker-curr-month">${monthData.year} - ${monthData.month}</span>
                <a href="#" class="ui-datepicker-btn ui-datepicker-next-btn">&gt;</a>
            </div>
            <div class="ui-datepicker-body">
                                               <table>
                                               <thead>
                                               <tr>
                                               <th>一</th>
                                               <th>二</th>
                                               <th>三</th>
                                               <th>四</th>
                                               <th>五</th>
                                               <th>六</th>
                                               <th>日</th>
                                               </tr>
                                               </thead>
                                               <tbody>
                                               ${dateHtml}
                                               </tbody>
                                               </table>
                                               </div>
        `;
        return html;
    }
    datepicker.render = function (direction) {
        let year, month;
        if (monthData) {
            year = monthData.year;
            month = monthData.month;
        }
        if (direction === "prev") month--;
        if (direction === "next") month++;

        const html = datepicker.buildUi(year, month);
        $wrapper = document.querySelector(".ui-datepicker-wrapper");
        if (!$wrapper) {
            $wrapper = document.createElement("div");
            document.body.appendChild($wrapper);
            $wrapper.className = "ui-datepicker-wrapper";
        }
        $wrapper.innerHTML = html;
    }
    datepicker.init = function (input) {
        datepicker.render();

        const $input = document.querySelector(input);
        let isOpen = false;
        $input.addEventListener("click", function () {
            if (isOpen) {
                $wrapper.classList.remove('ui-datepicker-wrapper-show');
                isOpen = false;
            } else {
                $wrapper.classList.add('ui-datepicker-wrapper-show');
                // datepicker的position為position
                // 計算datepicker出現的位置
                const left = $input.offsetLeft;
                const top = $input.offsetTop;
                const height = $input.offsetHeight;
                $wrapper.style.top = top + height + 2 + "px";
                $wrapper.style.left = left + "px";
                isOpen = true;
            }

        });

        $wrapper.addEventListener('click', function (e) {
            const $target = e.target;
            if (!$target.classList.contains('ui-datepicker-btn')) {
                return;
            }
            if ($target.classList.contains("ui-datepicker-prev-btn")) {
                datepicker.render("prev");
            } else if ($target.classList.contains("ui-datepicker-next-btn")) {
                datepicker.render("next");
            }

        }, false);
        $wrapper.addEventListener("click", function (e) {
            const $target = e.target;
            if ($target.tagName.toLowerCase() !== "td") return;
            const date = new Date(monthData.year, monthData.month - 1, $target.dataset.date);
            $input.value = format(date);
            $wrapper.classList.remove('ui-datepicker-wrapper-show');
            isOpen = false;
        }, false);

        function format(date) {
            let ret = "";
            const padding = num => {
                return num <= 9 ? `0${num}` : num;
            }
            return `${date.getFullYear()}-${padding(date.getMonth() + 1)}-${padding(date.getDate())}`
        }
    }
})()
