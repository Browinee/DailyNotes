(function () {
    const WEEK_DAYS = {
        Sunday: 0,
        Sunday_Offset: 7,
    }
    var datepicker = {};
    datepicker.getMonthData = function (year, month) {
        const ret = [];
        if (!year || !month) {
            const today = new Date();
            year = today.getFullYear();
            month = today.getMonth() + 1;
        }

        const firstDay = new Date(year, month - 1, 1);
        let firstDayWeekDay = firstDay.getDay();
        if (firstDayWeekDay === WEEK_DAYS.Sunday) firstDayWeekDay = WEEK_DAYS.Sunday_Offset;

        //month 可以越界
        year = firstDay.getFullYear();
        month = firstDay.getMonth() +1;

        const lastDayOfLastMonth = new Date(year, month - 1, 0)
        let lastDateOfLastMonth = lastDayOfLastMonth.getDate();

        // 計算第一行需要顯示幾個上個月的日期
        const preMonthDayCount = firstDayWeekDay - 1;

        const lastDay = new Date(year, month, 0);
        const lastDate = lastDay.getDate();

        // 每個月的週數不一致，統一用6週
        for(let i = 0; i< 7*6; i++ ) {
            const date = i + 1 - preMonthDayCount;
            let showDate = date;
            let thisMonth = month;
            // 上個月
            if (date <= 0) {
                thisMonth = month -1;
                showDate = lastDateOfLastMonth + date;

            } else if(date > lastDate) {
                 // 下個月
                thisMonth = month + 1;
                showDate = showDate - lastDate;
            }
            if(thisMonth === 0) thisMonth = 12;
            if(thisMonth === 13) thisMonth = 1;
            ret.push({
                month: thisMonth,
                date,
                showDate,
            });
        }

        return {
            year,
            month,
            days: ret,
        };
    };
    window.datepicker = datepicker;
})();
