import toastr from 'toastr';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import semver from 'semver';

import { settings } from '../../../settings';
import { t, APIClient } from '../../../utils';
import { modal } from '../../../ui-utils';
import { AppEvents } from '../communication';
import { Apps } from '../orchestrator';
import { SideNav } from '../../../ui-utils/client';

import './marketplace.html';
import './marketplace.css';

const ENABLED_STATUS = ['auto_enabled', 'manually_enabled'];
const enabled = ({ status }) => ENABLED_STATUS.includes(status);

const sortByColumn = (array, column, inverted) =>
	array.sort((a, b) => {
		if (a.latest[column] < b.latest[column] && !inverted) {
			return -1;
		}
		return 1;
	});

const getApps = async (instance) => {
	instance.isLoading.set(true);

	try {
		const data = await APIClient.get('apps?marketplace=true');

		instance.apps.set(data);
	} catch (e) {
		toastr.error((e.xhr.responseJSON && e.xhr.responseJSON.error) || e.message);
	}

	instance.isLoading.set(false);
	instance.ready.set(true);
};

const getInstalledApps = async (instance) => {
	try {
		const data = await APIClient.get('apps');
		const apps = data.apps.map((app) => ({ latest: app }));
		instance.installedApps.set(apps);
	} catch (e) {
		toastr.error((e.xhr.responseJSON && e.xhr.responseJSON.error) || e.message);
	}
};

const getCloudLoggedIn = async (instance) => {
	Meteor.call('cloud:checkUserLoggedIn', (error, result) => {
		if (error) {
			console.warn(error);
			return;
		}

		instance.cloudLoggedIn.set(result);
	});
};

const formatPrice = (price) => `\$${ Number.parseFloat(price).toFixed(2) }`;

const formatPrincingPlan = (pricingPlan) => {
	const perUser = pricingPlan.isPerSeat && pricingPlan.tiers && pricingPlan.tiers.length;

	const pricingPlanTranslationString = [
		'Apps_Marketplace_pricingPlan',
		pricingPlan.strategy,
		perUser && 'perUser',
	].filter(Boolean).join('_');

	return t(pricingPlanTranslationString, {
		price: formatPrice(pricingPlan.price),
	});
};

const triggerButtonLoadingState = (button) => {
	const icon = button.querySelector('.rc-icon use');
	const iconHref = icon.getAttribute('href');

	button.classList.add('js-loading');
	button.disabled = true;
	icon.setAttribute('href', '#icon-loading');

	return () => {
		button.classList.remove('js-loading');
		button.disabled = false;
		icon.setAttribute('href', iconHref);
	};
};

Template.marketplace.onCreated(function() {
	this.ready = new ReactiveVar(false);
	this.apps = new ReactiveVar([]);
	this.installedApps = new ReactiveVar([]);
	this.searchText = new ReactiveVar('');
	this.searchSortBy = new ReactiveVar('name');
	this.sortDirection = new ReactiveVar('asc');
	this.limit = new ReactiveVar(0);
	this.page = new ReactiveVar(0);
	this.end = new ReactiveVar(false);
	this.isLoading = new ReactiveVar(true);
	this.cloudLoggedIn = new ReactiveVar(false);

	getInstalledApps(this);
	getApps(this);
	getCloudLoggedIn(this);

	this.onAppAdded = async (appId) => {
		const installedApps = this.installedApps.get().filter((installedApp) => installedApp.appId !== appId);
		try {
			const { app } = await APIClient.get(`apps/${ appId }`);
			installedApps.push({ latest: app });
			this.installedApps.set(installedApps);
		} catch (e) {
			toastr.error((e.xhr.responseJSON && e.xhr.responseJSON.error) || e.message);
		}
	};

	this.onAppRemoved = (appId) => {
		const apps = this.apps.get();

		let index = -1;
		apps.find((item, i) => {
			if (item.id === appId) {
				index = i;
				return true;
			}
			return false;
		});

		apps.splice(index, 1);
		this.apps.set(apps);
	};

	Apps.getWsListener().registerListener(AppEvents.APP_ADDED, this.onAppAdded);
	Apps.getWsListener().registerListener(AppEvents.APP_REMOVED, this.onAppRemoved);
});

Template.marketplace.onDestroyed(function() {
	Apps.getWsListener().unregisterListener(AppEvents.APP_ADDED, this.onAppAdded);
	Apps.getWsListener().unregisterListener(AppEvents.APP_REMOVED, this.onAppRemoved);
});

Template.marketplace.helpers({
	isReady() {
		if (Template.instance().ready != null) {
			return Template.instance().ready.get();
		}

		return false;
	},
	apps() {
		const instance = Template.instance();
		const searchText = instance.searchText.get().toLowerCase();
		const sortColumn = instance.searchSortBy.get();
		const inverted = instance.sortDirection.get() === 'desc';
		return sortByColumn(instance.apps.get().filter((app) => app.latest.name.toLowerCase().includes(searchText)), sortColumn, inverted);
	},
	appsDevelopmentMode() {
		return settings.get('Apps_Framework_Development_Mode') === true;
	},
	cloudLoggedIn() {
		return Template.instance().cloudLoggedIn.get();
	},
	parseStatus(status) {
		return t(`App_status_${ status }`);
	},
	isActive(status) {
		return enabled({ status });
	},
	sortIcon(key) {
		const {
			sortDirection,
			searchSortBy,
		} = Template.instance();

		return key === searchSortBy.get() && sortDirection.get() !== 'asc' ? 'sort-up' : 'sort-down';
	},
	searchSortBy(key) {
		return Template.instance().searchSortBy.get() === key;
	},
	isLoading() {
		return Template.instance().isLoading.get();
	},
	onTableScroll() {
		const instance = Template.instance();
		if (instance.loading || instance.end.get()) {
			return;
		}
		return function(currentTarget) {
			if (currentTarget.offsetHeight + currentTarget.scrollTop >= currentTarget.scrollHeight - 100) {
				return instance.page.set(instance.page.get() + 1);
			}
		};
	},
	onTableResize() {
		const { limit } = Template.instance();

		return function() {
			limit.set(Math.ceil((this.$('.table-scroll').height() / 40) + 5));
		};
	},
	onTableSort() {
		const { end, page, sortDirection, searchSortBy } = Template.instance();
		return function(type) {
			end.set(false);
			page.set(0);

			if (searchSortBy.get() === type) {
				sortDirection.set(sortDirection.get() === 'asc' ? 'desc' : 'asc');
				return;
			}

			searchSortBy.set(type);
			sortDirection.set('asc');
		};
	},
	purchaseTypeDisplay(app) {
		if (app.purchaseType === 'subscription') {
			return t('Subscription');
		}

		if (app.price > 0) {
			return t('Paid');
		}

		return t('Free');
	},
	priceDisplay(app) {
		if (app.purchaseType === 'subscription') {
			if (!app.pricingPlans || !Array.isArray(app.pricingPlans) || app.pricingPlans.length === 0) {
				return '-';
			}

			return formatPrincingPlan(app.pricingPlans[0]);
		}

		if (app.price > 0) {
			return formatPrice(app.price);
		}

		return '-';
	},
	isInstalled(app) {
		const { installedApps } = Template.instance();
		const installedApp = installedApps.get().find(({ latest: { id } }) => id === app.latest.id);
		return !!installedApp;
	},
	isOnTrialPeriod(app) {
		return app.subscriptionInfo.status === 'trialing';
	},
	canUpdate(app) {
		const { installedApps } = Template.instance();
		const installedApp = installedApps.get().find(({ latest: { id } }) => id === app.latest.id);
		return !!installedApp && semver.lt(installedApp.latest.version, app.latest.version);
	},
	canTry(app) {
		return app.purchaseType === 'subscription' && !app.subscriptionInfo.status;
	},
	canBuy(app) {
		return app.price > 0;
	},
});

Template.marketplace.events({
	'click .manage'() {
		const rl = this;

		if (rl && rl.latest && rl.latest.id) {
			FlowRouter.go(`/admin/apps/${ rl.latest.id }?version=${ rl.latest.version }`);
		}
	},
	'click [data-button="install"]'() {
		FlowRouter.go('/admin/app/install');
	},
	'click [data-button="login"]'() {
		FlowRouter.go('/admin/cloud');
	},
	async 'click .js-install'(e, template) {
		e.stopPropagation();
		const { currentTarget: button } = e;
		const stopLoading = triggerButtonLoadingState(button);

		try {
			await APIClient.post('apps/', {
				appId: this.latest.id,
				marketplace: true,
				version: this.latest.version,
			});
			await Promise.all([
				getInstalledApps(template),
				getApps(template),
			]);
		} catch (e) {
			toastr.error((e.xhr.responseJSON && e.xhr.responseJSON.error) || e.message);
		} finally {
			stopLoading();
		}
	},
	async 'click .js-purchase'(e, template) {
		e.stopPropagation();

		if (!template.cloudLoggedIn.get()) {
			modal.open({
				title: t('Apps_Marketplace_Login_Required_Title'),
				text: t('Apps_Marketplace_Login_Required_Description'),
				type: 'info',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				confirmButtonText: t('Login'),
				cancelButtonText: t('Cancel'),
				closeOnConfirm: true,
				html: false,
			}, (confirmed) => {
				if (confirmed) {
					FlowRouter.go('/admin/cloud');
				}
			});
			return;
		}

		const { latest, purchaseType } = this;

		const { currentTarget: button } = e;
		const stopLoading = triggerButtonLoadingState(button);

		let data = null;
		try {
			data = await APIClient.get(`apps?buildExternalUrl=true&appId=${ latest.id }&purchaseType=${ purchaseType || 'buy' }`);
		} catch (e) {
			const errMsg = (e.xhr.responseJSON && e.xhr.responseJSON.error) || e.message;
			toastr.error(errMsg);

			if (errMsg === 'Unauthorized') {
				getCloudLoggedIn(template);
			}

			stopLoading();

			return;
		}

		modal.open({
			allowOutsideClick: false,
			data,
			template: 'iframeModal',
		}, async () => {
			button.classList.add('js-loading');

			try {
				await APIClient.post('apps/', {
					appId: this.latest.id,
					marketplace: true,
					version: this.latest.version,
				});
				await Promise.all([
					getInstalledApps(template),
					getApps(template),
				]);
			} catch (e) {
				toastr.error((e.xhr.responseJSON && e.xhr.responseJSON.error) || e.message);
			} finally {
				stopLoading();
			}
		}, stopLoading);
	},
	'keyup .js-search'(e, t) {
		t.searchText.set(e.currentTarget.value);
	},
	'submit .js-search-form'(e) {
		e.preventDefault();
		e.stopPropagation();
	},
});

Template.marketplace.onRendered(() => {
	Tracker.afterFlush(() => {
		SideNav.setFlex('adminFlex');
		SideNav.openFlex();
	});
});
